const AUTH_URL = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";
const BASE_URL = "https://tdx.transportdata.tw/api/basic/v2/Bus";

let tokenCache = null;
const responseCache = new Map();

const ALLOWED_PREFIXES = [
  "/Stop/City/",
  "/StopOfRoute/City/",
  "/EstimatedTimeOfArrival/City/",
  "/RealTimeByFrequency/City/",
  "/RealTimeNearStop/City/",
  "/Shape/City/",
  "/Route/City/"
];

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function cacheTtl(path) {
  if (path.startsWith("/RealTime") || path.startsWith("/EstimatedTimeOfArrival")) return 12 * 1000;
  if (path.startsWith("/Shape") || path.startsWith("/Stop") || path.startsWith("/Route")) return 24 * 60 * 60 * 1000;
  return 30 * 1000;
}

async function getToken() {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30000) return tokenCache.accessToken;

  const clientId = process.env.TDX_CLIENT_ID;
  const clientSecret = process.env.TDX_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    const err = new Error("Missing TDX_CLIENT_ID or TDX_CLIENT_SECRET on the server.");
    err.status = 500;
    throw err;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) {
    const err = new Error("TDX auth failed.");
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  tokenCache = {
    accessToken: json.access_token,
    expiresAt: now + (json.expires_in || 86400) * 1000
  };
  return tokenCache.accessToken;
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const path = String(req.query.path || "");
    if (!path.startsWith("/") || !ALLOWED_PREFIXES.some(prefix => path.startsWith(prefix))) {
      return res.status(400).json({ error: "Unsupported TDX path" });
    }

    const now = Date.now();
    const cached = responseCache.get(path);
    if (cached && cached.expiresAt > now) {
      res.setHeader("Cache-Control", "public, max-age=10, s-maxage=10");
      return res.status(200).json(cached.value);
    }

    const token = await getToken();
    const sep = path.includes("?") ? "&" : "?";
    const tdxUrl = BASE_URL + path + sep + "$format=JSON";
    const upstream = await fetch(tdxUrl, { headers: { authorization: "Bearer " + token } });
    const text = await upstream.text();

    if (!upstream.ok) {
      if (upstream.status === 429) res.setHeader("Retry-After", upstream.headers.get("Retry-After") || "3");
      return res.status(upstream.status).send(text || JSON.stringify({ error: "TDX request failed" }));
    }

    const value = text ? JSON.parse(text) : [];
    responseCache.set(path, { value, expiresAt: now + cacheTtl(path) });
    res.setHeader("Cache-Control", "public, max-age=10, s-maxage=10");
    return res.status(200).json(value);
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message || "TDX proxy error" });
  }
};
