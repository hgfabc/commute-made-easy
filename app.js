/* ===========================================================================
 * Commute Made Easy — Taipei Bus Tracker
 * Main application (React via Babel, no build step required)
 * =========================================================================== */
const { useState, useEffect, useRef, useCallback } = React;
const CFG = Object.assign({
  TDX_API_BASE: "",
  TDX_CLIENT_ID: "",
  TDX_CLIENT_SECRET: "",
  GOOGLE_MAPS_API_KEY: "",
  CITY: "Taipei",
  CITY_LABEL: "Taipei",
  DEFAULT_CENTER: { lat: 25.0478, lng: 121.5170 }
}, window.APP_CONFIG || {});

/* ---------------------------------------------------------------------------
 * i18n — UI chrome strings + a helper to pick a TDX name in the chosen language.
 * ------------------------------------------------------------------------- */
const STR = {
  en: {
    route: "Bus number", stop: "Stop", trip: "Plan trip", game: "Wait game", favs: "Favorites",
    search: "Search", refresh: "↻ Refresh live", findRoutes: "Find routes",
    routePh: "Bus number, e.g. 307 or 信義幹線",
    stopPh: "Stop name, e.g. Taipei Main Station / 台北車站",
    fromPh: "From — e.g. Taipei 101", toPh: "To — e.g. Taipei Main Station",
    keysMissing: "Add public config + a TDX backend proxy before sharing this app.",
    subtitle: "buses", noStopArr: "No live arrivals reported right now.",
    favEmpty: "No favorites yet. Tap the ☆ next to a route or stop to save it here.",
    routesH: "Routes", stopsH: "Stops", fetching: "Fetching route…", planning: "Planning…",
    noRoute: "No route named", noStopMatch: "No stop matching",
    routeWord: "Route", walk: "Walk", take: "Take",
    showAll: "Show opposite-direction buses", viewRoutes: "Routes at this stop",
    appName: "Commute Made Easy", cityMode: "Taipei network", liveBoard: "Live board",
    routePanel: "Route radar", stopPanel: "Stop board", tripPanel: "Trip planner", gamePanel: "Wait game", favPanel: "Saved",
    activeRoute: "Active route", noRouteLoaded: "Search a route to start.",
    stopsMetric: "Stops", vehiclesMetric: "Vehicles", directionMetric: "Direction",
    departures: "Departures", matches: "Matches", savedRoutes: "Saved routes", savedStops: "Saved stops",
    map: "Map", now: "Now", routeLine: "Road geometry", history: "Search history",
    rateLimited: "TDX is rate-limiting live stop arrivals. Please try this stop again in a few seconds.",
    autoRefresh: "Auto-refresh: 15s",
    allowLocation: "Allow location", updateLocation: "Update location", locating: "Finding you…",
    nearestStop: "Nearest stop", locationUnavailable: "Location is not available in this browser.",
    locationDenied: "Location permission was blocked. Allow location in browser settings and try again.",
    directionsDenied: "Google Directions denied this request. Enable Directions API, confirm billing is active, and make sure this API key allows the current test URL such as localhost, your Mac's LAN IP, or your beta URL.",
    directionsNoRoute: "Google could not find a transit route for those places. Try full names like Taipei 101 and Taipei Main Station.",
    start: "Start", reset: "Reset", score: "Score", best: "Best", streak: "Streak",
    gameReady: "Ready", gameWait: "Wait for it", gameDrop: "Catch it", gameCaught: "Caught", gameMissed: "Missed",
    statuses: { arriving: "Arriving", min: "min", 1: "Not departed", 2: "Not stopping", 3: "Last bus passed", 4: "No service today" }
  },
  zh: {
    route: "公車號", stop: "站牌", trip: "路線規劃", game: "等車小遊戲", favs: "我的最愛",
    search: "搜尋", refresh: "↻ 更新即時", findRoutes: "查詢路線",
    routePh: "公車號，例如 307 或 信義幹線",
    stopPh: "站牌名稱，例如 台北車站",
    fromPh: "起點 — 例如 台北101", toPh: "終點 — 例如 台北車站",
    keysMissing: "請先設定公開設定與 TDX 後端代理，再分享此 app。",
    subtitle: "公車", noStopArr: "目前沒有即時到站資訊。",
    favEmpty: "尚無收藏。點路線或站牌旁的 ☆ 即可加入。",
    routesH: "路線", stopsH: "站牌", fetching: "載入路線中…", planning: "規劃中…",
    noRoute: "查無路線", noStopMatch: "查無站牌",
    routeWord: "路線", walk: "步行", take: "搭乘",
    showAll: "顯示反向車輛", viewRoutes: "此站所有路線",
    appName: "Commute Made Easy", cityMode: "台北路網", liveBoard: "即時看板",
    routePanel: "路線雷達", stopPanel: "站牌看板", tripPanel: "旅程規劃", gamePanel: "等車小遊戲", favPanel: "收藏",
    activeRoute: "目前路線", noRouteLoaded: "搜尋路線開始。",
    stopsMetric: "站數", vehiclesMetric: "車輛", directionMetric: "方向",
    departures: "到站資訊", matches: "符合站牌", savedRoutes: "收藏路線", savedStops: "收藏站牌",
    map: "地圖", now: "現在", routeLine: "道路線形", history: "搜尋紀錄",
    rateLimited: "TDX 目前限制即時站牌查詢，請幾秒後再試一次。",
    autoRefresh: "每 15 秒自動更新",
    allowLocation: "允許定位", updateLocation: "更新定位", locating: "定位中…",
    nearestStop: "最近站牌", locationUnavailable: "此瀏覽器無法使用定位。",
    locationDenied: "定位權限被阻擋。請在瀏覽器設定允許定位後再試一次。",
    directionsDenied: "Google Directions 拒絕此請求。請啟用 Directions API、確認帳單已啟用，並確認 API key 允許目前測試網址，例如 localhost、Mac 的區網 IP 或 beta 網址。",
    directionsNoRoute: "Google 找不到這兩地的大眾運輸路線。請試試完整名稱，例如 Taipei 101 和 Taipei Main Station。",
    start: "開始", reset: "重置", score: "分數", best: "最高", streak: "連擊",
    gameReady: "準備", gameWait: "等一下", gameDrop: "接住", gameCaught: "接到了", gameMissed: "落地了",
    statuses: { arriving: "進站中", min: "分鐘", 1: "尚未發車", 2: "不停靠", 3: "末班車已過", 4: "今日未營運" }
  }
};
// Pick a name from a TDX {Zh_tw, En} object (or from separate zh/en strings).
function pickName(zh, en, lang) { return lang === "en" ? (en || zh || "") : (zh || en || ""); }
// TDX official data uses 臺 (not 台). Generate both variants so a search matches either.
function zhVariants(q) {
  const set = new Set([q, q.replace(/台/g, "臺"), q.replace(/臺/g, "台")]);
  return [...set].filter(Boolean);
}

/* Common nicknames -> official stop name (substring matched). Add your own here.
   Most abbreviations (北車, 安森, 大森公) already work via subsequence matching below,
   so this is only needed for nicknames whose characters aren't an in-order subset. */
const STOP_ALIASES = {
  "北車": "臺北車站", "大森公": "大安森林公園", "安森": "大安森林公園",
  "北車站": "臺北車站", "西門町": "西門"
};

// True if every char of `needle` appears in `hay` in order (e.g. 大森公 ⊂ 大安森林公園).
function isSubseq(needle, hay) {
  if (!needle) return false;
  let i = 0;
  for (const c of hay) { if (c === needle[i]) i++; if (i === needle.length) return true; }
  return false;
}

/* Rank a cached stop list against a query: exact/alias > substring > subsequence. */
function matchStops(index, query) {
  const q = query.trim();
  if (!q) return [];
  const variants = zhVariants(q);
  const aliasTarget = STOP_ALIASES[q];
  const ql = q.toLowerCase();
  const scored = [];
  for (const st of index) {
    const zh = st.zh || "";
    let score = 0;
    if (aliasTarget && zh.includes(aliasTarget)) score = Math.max(score, 100);
    if (variants.some(v => zh.includes(v))) score = Math.max(score, 80);
    if (st.en && ql && st.en.toLowerCase().includes(ql)) score = Math.max(score, 70);
    if (variants.some(v => isSubseq(v, zh))) score = Math.max(score, 45 - Math.min(20, zh.length));
    if (score > 0) scored.push({ st, score });
  }
  scored.sort((a, b) => b.score - a.score || a.st.zh.length - b.st.zh.length);
  return scored.slice(0, 40).map(x => x.st);
}

/* ---------------------------------------------------------------------------
 * TDX service — uses a backend proxy when configured; local-only config.js can
 * still call TDX directly for private development.
 * ------------------------------------------------------------------------- */
const TDX = (() => {
  const AUTH_URL = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";
  const BASE = "https://tdx.transportdata.tw/api/basic/v2/Bus";
  let tokenCache = null;
  const proxyBase = () => (CFG.TDX_API_BASE || "").replace(/\/$/, "");

  async function getToken() {
    const now = Date.now();
    if (tokenCache && tokenCache.expires_at > now + 30000) return tokenCache.access_token;
    if (!CFG.TDX_CLIENT_ID || CFG.TDX_CLIENT_ID.startsWith("YOUR_")) {
      throw new Error("Missing TDX keys. Open config.js and paste your Client Id / Secret.");
    }
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CFG.TDX_CLIENT_ID,
      client_secret: CFG.TDX_CLIENT_SECRET
    });
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (!res.ok) throw new Error("TDX auth failed (" + res.status + "). Check your Client Id / Secret.");
    const json = await res.json();
    tokenCache = { access_token: json.access_token, expires_at: now + (json.expires_in || 86400) * 1000 };
    return tokenCache.access_token;
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function get(path, retry = 0) {
    const proxy = proxyBase();
    let url, options = {};
    if (proxy) {
      const sep = proxy.includes("?") ? "&" : "?";
      url = proxy + sep + "path=" + encodeURIComponent(path);
    } else {
      const token = await getToken();
      const sep = path.includes("?") ? "&" : "?";
      url = BASE + path + sep + "$format=JSON";
      options.headers = { authorization: "Bearer " + token };
    }
    const res = await fetch(url, options);
    if (!res.ok) {
      if ((res.status === 429 || res.status >= 500) && retry < 2) {
        const retryAfter = Number(res.headers.get("Retry-After"));
        const wait = retryAfter ? retryAfter * 1000 : (res.status === 429 ? 1400 * (retry + 1) : 700 * (retry + 1));
        await sleep(wait);
        return get(path, retry + 1);
      }
      const err = new Error("TDX request failed (" + res.status + "): " + path);
      err.status = res.status;
      err.path = path;
      throw err;
    }
    return res.json();
  }

  const enc = encodeURIComponent;
  const city = () => CFG.CITY;

  // Full city stop list, fetched once and cached, for smart client-side matching.
  let stopIndexCache = null;
  async function loadStopIndex() {
    if (stopIndexCache) return stopIndexCache;
    const data = await get(`/Stop/City/${city()}?$select=StopName&$top=20000`);
    const seen = new Set(); const list = [];
    data.forEach(s => {
      const zh = s.StopName?.Zh_tw;
      if (zh && !seen.has(zh)) { seen.add(zh); list.push({ zh, en: s.StopName?.En || "" }); }
    });
    stopIndexCache = list;
    return list;
  }

  const stopEtaCache = new Map();
  const stopEtaInFlight = new Map();
  async function etaAtStop(stopName) {
    const key = stopName;
    const cached = stopEtaCache.get(key);
    if (cached && cached.expires > Date.now()) return cached.value;
    if (stopEtaInFlight.has(key)) return stopEtaInFlight.get(key);
    const request = (async () => {
      const value = await get(`/EstimatedTimeOfArrival/City/${city()}?$filter=StopName/Zh_tw eq '${enc(stopName)}'&$top=60`);
      stopEtaCache.set(key, { value, expires: Date.now() + 45000 });
      return value;
    })().catch(e => {
      if (e.status === 429 && cached) return cached.value;
      throw e;
    }).finally(() => stopEtaInFlight.delete(key));
    stopEtaInFlight.set(key, request);
    return request;
  }

  return {
    getToken,
    loadStopIndex,
    stopsOfRoute: (route) => get(`/StopOfRoute/City/${city()}/${enc(route)}`),
    etaOfRoute: (route) => get(`/EstimatedTimeOfArrival/City/${city()}/${enc(route)}`),
    realtimeOfRoute: (route) => get(`/RealTimeByFrequency/City/${city()}/${enc(route)}`),
    // Real road-following geometry of the route (WKT), ordered in travel direction.
    shapeOfRoute: (route) => get(`/Shape/City/${city()}/${enc(route)}`),
    // Which live bus (plate) is at/approaching each stop — used to infer plates the ETA feed omits.
    nearStopOfRoute: (route) => get(`/RealTimeNearStop/City/${city()}/${enc(route)}`),
    findRoutes: (name) => get(`/Route/City/${city()}?$filter=contains(RouteName/Zh_tw,'${enc(name)}')&$top=30`),
    findStops: (name) => {
      // Match 台/臺 variants (and English) so common queries don't return empty.
      const ors = zhVariants(name).map(v => `contains(StopName/Zh_tw,'${enc(v)}')`);
      ors.push(`contains(StopName/En,'${enc(name)}')`);
      return get(`/Stop/City/${city()}?$filter=${ors.join(" or ")}&$top=60`);
    },
    etaAtStop
  };
})();

/* ---------------------------------------------------------------------------
 * Favorites — persisted in localStorage on the user's machine.
 * ------------------------------------------------------------------------- */
const Favorites = {
  KEY: "cme_favorites_v1",
  read() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { routes: [], stops: [] }; }
    catch { return { routes: [], stops: [] }; }
  },
  write(data) { localStorage.setItem(this.KEY, JSON.stringify(data)); },
  toggleRoute(name) {
    const d = this.read();
    d.routes = d.routes.includes(name) ? d.routes.filter(r => r !== name) : [...d.routes, name];
    this.write(d); return d;
  },
  toggleStop(name) {
    const d = this.read();
    d.stops = d.stops.includes(name) ? d.stops.filter(s => s !== name) : [...d.stops, name];
    this.write(d); return d;
  }
};

const SearchHistory = {
  KEY: "cme_search_history_v1",
  read() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { routes: [], stops: [] }; }
    catch { return { routes: [], stops: [] }; }
  },
  write(data) { localStorage.setItem(this.KEY, JSON.stringify(data)); },
  add(type, value) {
    const v = (value || "").trim();
    if (!v) return this.read();
    const d = this.read();
    const key = type === "stops" ? "stops" : "routes";
    d[key] = [v, ...(d[key] || []).filter(x => x !== v)].slice(0, 8);
    this.write(d);
    return d;
  }
};

/* ---------------------------------------------------------------------------
 * Google Maps loader (JS SDK) — independent of any MCP.
 * ------------------------------------------------------------------------- */
let mapsPromise = null;
function loadGoogleMaps() {
  if (mapsPromise) return mapsPromise;
  if (!CFG.GOOGLE_MAPS_API_KEY || CFG.GOOGLE_MAPS_API_KEY.startsWith("YOUR_")) {
    return Promise.reject(new Error("Missing Google Maps key. Add it in config.js to see the map."));
  }
  mapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://maps.googleapis.com/maps/api/js?key=" + CFG.GOOGLE_MAPS_API_KEY + "&libraries=geometry";
    s.async = true;
    s.onload = () => resolve(window.google);
    s.onerror = () => reject(new Error("Google Maps failed to load. Check your API key + enabled APIs."));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

// A usable estimate exists when EstimateTime is present and the bus is normal (0)
// or simply not yet departed (1) — TDX still gives a valid time in that case.
function hasEta(e) { return e && e.EstimateTime != null && e.EstimateTime >= 0 && (e.StopStatus === 0 || e.StopStatus === 1); }
// TDX uses "-1"/"" when no vehicle is assigned to an arrival prediction.
function plateText(p) { return (p && p !== "-1") ? p : ""; }
function etaLabel(e, lang) {
  const st = STR[lang || "en"].statuses;
  if (hasEta(e)) {
    const m = Math.round(e.EstimateTime / 60);
    return m <= 0 ? st.arriving : m + " " + st.min;
  }
  return st[e.StopStatus] || st[4] || "—";
}

// Great-circle distance in metres — used to detect implausible jumps in geometry.
function haversine(a, b) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
  const la1 = a.lat * toR, la2 = b.lat * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function pointSegmentDistanceMeters(p, a, b) {
  if (!p || !a || !b) return Infinity;
  const metersPerLat = 111320;
  const metersPerLng = 111320 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  const ax = a.lng * metersPerLng, ay = a.lat * metersPerLat;
  const bx = b.lng * metersPerLng, by = b.lat * metersPerLat;
  const px = p.lng * metersPerLng, py = p.lat * metersPerLat;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (!len2) return haversine(p, a);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}
function distanceToPathsMeters(p, paths) {
  if (!p || !paths || !paths.length) return Infinity;
  let best = Infinity;
  paths.forEach(path => {
    for (let i = 1; i < path.length; i++) {
      best = Math.min(best, pointSegmentDistanceMeters(p, path[i - 1], path[i]));
      if (best <= 120) return;
    }
  });
  return best;
}
function distanceToStopsMeters(p, stops) {
  if (!p || !stops || !stops.length) return Infinity;
  return stops.reduce((best, s) => (s.lat && s.lng ? Math.min(best, haversine(p, s)) : best), Infinity);
}
function nearestStopIndex(p, stops) {
  if (!p || !stops || !stops.length) return -1;
  let bestIdx = -1, best = Infinity;
  stops.forEach((s, i) => {
    if (!s.lat || !s.lng) return;
    const d = haversine(p, s);
    if (d < best) { best = d; bestIdx = i; }
  });
  return bestIdx;
}
function scorePathsAgainstStops(paths, stops) {
  const valid = (stops || []).filter(s => s.lat && s.lng);
  if (!paths || !paths.length || !valid.length) return 0;
  return valid.reduce((sum, s) => {
    const d = distanceToPathsMeters({ lat: s.lat, lng: s.lng }, paths);
    return sum + Math.max(0, 1000 - d);
  }, 0);
}
// Sanity bounds for Taiwan — rejects stray 0,0 / out-of-region coordinates.
function inTaiwan(p) { return p.lat >= 21.5 && p.lat <= 26.6 && p.lng >= 118 && p.lng <= 122.5; }

/* Parse a WKT LINESTRING / MULTILINESTRING into [[{lat,lng}, ...], ...].
   TDX gives coordinates as "lon lat", ordered along the direction of travel.
   Defends against phantom lines: filters junk coords and splits on big gaps. */
function wktToPaths(wkt) {
  if (!wkt || typeof wkt !== "string") return [];
  const multi = wkt.trim().toUpperCase().startsWith("MULTILINESTRING");
  const open = wkt.indexOf("("), close = wkt.lastIndexOf(")");
  if (open < 0 || close < 0) return [];
  const body = wkt.substring(open + 1, close);
  const segs = multi ? body.split(/\)\s*,\s*\(/) : [body];
  const raw = segs.map(seg => seg.replace(/[()]/g, "").split(",").map(pair => {
    const n = pair.trim().split(/\s+/).map(Number);
    return { lat: n[1], lng: n[0] };
  }).filter(p => isFinite(p.lat) && isFinite(p.lng) && inTaiwan(p)));

  // Break each path wherever consecutive points jump > 1.5 km. Such a gap is a data
  // artifact; connecting across it is what renders a phantom straight line.
  const GAP = 1500;
  const out = [];
  raw.forEach(pts => {
    let run = [];
    for (let i = 0; i < pts.length; i++) {
      if (run.length && haversine(run[run.length - 1], pts[i]) > GAP) { if (run.length > 1) out.push(run); run = []; }
      run.push(pts[i]);
    }
    if (run.length > 1) out.push(run);
  });
  return out;
}

/* ========================= UI primitives ========================= */
function StarButton({ active, onClick }) {
  return (
    <button onClick={onClick}
      className={"grid h-9 w-9 place-items-center rounded-md border text-lg leading-none transition " + (active ? "border-amber-300 bg-amber-100 text-amber-600" : "border-slate-200 bg-white text-slate-300 hover:border-amber-300 hover:text-amber-500")}
      title={active ? "Remove from favorites" : "Add to favorites"}>
      {active ? "★" : "☆"}
    </button>
  );
}
function Spinner({ label }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-slate-500 text-sm">
      <span className="inline-block w-4 h-4 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin"></span>
      {label || "Loading…"}
    </div>
  );
}
function ErrorNote({ children }) {
  return <div className="border border-rose-200 bg-rose-50 text-rose-700 text-sm rounded-md px-3 py-2">{children}</div>;
}
function Panel({ children, className = "" }) {
  return <section className={"min-w-0 rounded-md border border-slate-200 bg-white/90 shadow-sm " + className}>{children}</section>;
}
function TextInput(props) {
  return (
    <input {...props}
      className={"h-11 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 " + (props.className || "")} />
  );
}
function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button {...props}
      className={"h-11 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-200 " + className}>
      {children}
    </button>
  );
}
function GhostButton({ children, active, className = "", ...props }) {
  return (
    <button {...props}
      className={(active
        ? "border-slate-900 bg-slate-900 text-white "
        : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-800 ")
        + "rounded-md border px-3 py-2 text-sm font-medium transition " + className}>
      {children}
    </button>
  );
}
function Metric({ label, value, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-800",
    teal: "border-teal-200 bg-teal-50 text-teal-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800"
  };
  return (
    <div className={"rounded-md border px-3 py-2 " + (tones[tone] || tones.slate)}>
      <div className="text-[11px] font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-0.5 truncate text-lg font-semibold leading-6">{value}</div>
    </div>
  );
}
function EtaPill({ entry, lang }) {
  const urgent = hasEta(entry) && Math.round(entry.EstimateTime / 60) <= 2;
  return (
    <span className={"inline-flex min-w-[62px] justify-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold sm:min-w-[76px] sm:px-2 sm:py-1 sm:text-xs " + (urgent ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
      {entry ? etaLabel(entry, lang) : "—"}
    </span>
  );
}
function HistoryChips({ label, items, onPick }) {
  if (!items || !items.length) return null;
  return (
    <div className="mt-3">
      <div className="mb-2 text-[11px] font-semibold uppercase text-slate-500">{label}</div>
      <div className="cme-scroll flex gap-2 overflow-x-auto pb-1">
        {items.map(item => (
          <button key={item} type="button" onClick={() => onPick(item)}
            className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
function busMarkerSvg(heading) {
  return "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>"
    + "<defs>"
    + "<linearGradient id='body' x1='18' y1='8' x2='46' y2='58' gradientUnits='userSpaceOnUse'><stop stop-color='#ffdc3c'/><stop offset='0.46' stop-color='#ffd226'/><stop offset='1' stop-color='#f6b716'/></linearGradient>"
    + "<linearGradient id='glass' x1='22' y1='13' x2='42' y2='24' gradientUnits='userSpaceOnUse'><stop stop-color='#40586a'/><stop offset='1' stop-color='#20313f'/></linearGradient>"
    + "<filter id='shadow' x='-30%' y='-30%' width='160%' height='160%'><feDropShadow dx='0' dy='2' stdDeviation='2' flood-color='#0f172a' flood-opacity='0.38'/></filter>"
    + "<radialGradient id='headlight' cx='50%' cy='50%' r='60%'><stop stop-color='#fffce8'/><stop offset='0.55' stop-color='#fff7bf'/><stop offset='1' stop-color='#facc15'/></radialGradient>"
    + "</defs>"
    + "<g transform='rotate(" + heading + " 32 32)' filter='url(#shadow)'>"
    + "<path d='M25 9 5 0h23l1 8Z' fill='#fde68a' opacity='0.42'/><path d='M39 9 59 0H36l-1 8Z' fill='#fde68a' opacity='0.42'/>"
    + "<path d='M18 18h-3.5a3.5 3.5 0 0 0-3.5 3.5v5.5a2.5 2.5 0 0 0 2.5 2.5H17Z' fill='#223442'/><path d='M46 18h3.5a3.5 3.5 0 0 1 3.5 3.5v5.5a2.5 2.5 0 0 1-2.5 2.5H47Z' fill='#223442'/>"
    + "<path d='M20 12c0-5 3.5-7 12-7s12 2 12 7v41c0 4.5-3.5 7-12 7s-12-2.5-12-7Z' fill='url(#body)' stroke='#e4aa12' stroke-width='1.1'/>"
    + "<rect x='22.5' y='13.2' width='19' height='8.8' rx='2.8' fill='url(#glass)' stroke='#17212f' stroke-width='0.9'/>"
    + "<rect x='24.5' y='50' width='15' height='5.3' rx='2.2' fill='#2f4556'/>"
    + "<rect x='18.4' y='25.5' width='3' height='7' rx='1.5' fill='#2f4556'/><rect x='42.6' y='25.5' width='3' height='7' rx='1.5' fill='#2f4556'/>"
    + "<rect x='18.4' y='36.5' width='3' height='7' rx='1.5' fill='#2f4556'/><rect x='42.6' y='36.5' width='3' height='7' rx='1.5' fill='#2f4556'/>"
    + "<rect x='18.4' y='47.2' width='3' height='7' rx='1.5' fill='#2f4556'/><rect x='42.6' y='47.2' width='3' height='7' rx='1.5' fill='#2f4556'/>"
    + "<circle cx='25' cy='10.2' r='2.3' fill='url(#headlight)'/><circle cx='39' cy='10.2' r='2.3' fill='url(#headlight)'/>"
    + "<rect x='25.6' y='8.1' width='3.8' height='2.1' rx='1' fill='#e87920' opacity='0.75'/><rect x='34.6' y='8.1' width='3.8' height='2.1' rx='1' fill='#e87920' opacity='0.75'/>"
    + "<rect x='24' y='56.5' width='4.2' height='2.2' rx='1.1' fill='#ef4444'/><rect x='35.8' y='56.5' width='4.2' height='2.2' rx='1.1' fill='#ef4444'/>"
    + "<rect x='27.5' y='31' width='9' height='14' rx='2.8' fill='none' stroke='#eab01c' stroke-width='1.5' opacity='0.72'/>"
    + "<path d='M29 35h6M29 38.5h6M29 42h6' stroke='#d69b12' stroke-width='1.2' stroke-linecap='round'/>"
    + "</g>"
    + "</svg>";
}

/* ========================= Map panel ========================= */
function MapPanel({ stops, vehicles, directionsResult, routePaths, onStopClick, stopActionLabel, userLocation }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const overlays = useRef([]);
  const dirRenderer = useRef(null);
  const infoRef = useRef(null);
  const [err, setErr] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((g) => {
      if (cancelled || mapRef.current) return;
      mapRef.current = new g.maps.Map(ref.current, {
        center: CFG.DEFAULT_CENTER, zoom: 13, mapTypeControl: false, streetViewControl: false
      });
      setMapReady(true);
    }).catch(e => setErr(e.message));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const g = window.google;
    if (!g || !mapRef.current) return;
    overlays.current.forEach(o => o.setMap(null));
    overlays.current = [];
    const bounds = new g.maps.LatLngBounds();
    let hasBounds = false;
    // Repeating arrowheads convey direction of travel along the line.
    // Palette for a cleaner "transit map" look.
    const LINE = "#2563eb", CASING = "#1e3a8a";
    const arrow = { icon: { path: g.maps.SymbolPath.FORWARD_OPEN_ARROW, scale: 2, strokeColor: "#ffffff", strokeOpacity: 0.95, strokeWeight: 1.4 }, offset: "1%", repeat: "150px" };
    // Casing underneath + colored line on top = polished, readable route line.
    const drawLine = (path, weight, opacity) => {
      overlays.current.push(new g.maps.Polyline({ path, strokeColor: CASING, strokeOpacity: 0.22, strokeWeight: weight + 4, map: mapRef.current, zIndex: 1 }));
      overlays.current.push(new g.maps.Polyline({ path, strokeColor: LINE, strokeOpacity: opacity, strokeWeight: weight, map: mapRef.current, icons: [arrow], zIndex: 2 }));
    };
    const paths = (routePaths && routePaths.length) ? routePaths : null;

    if (paths) {
      // Real road-following geometry from TDX Shape.
      paths.forEach(p => {
        drawLine(p, 5, 0.95);
        p.forEach(pt => { bounds.extend(pt); hasBounds = true; });
      });
    }

    const pts = (stops || []).filter(s => s.lat && s.lng);
    if (pts.length) {
      // Fallback only when no geometry is available: straight connectors (still arrowed).
      if (!paths) {
        const straight = pts.map(s => ({ lat: s.lat, lng: s.lng }));
        drawLine(straight, 4, 0.5);
      }
      if (!infoRef.current) infoRef.current = new g.maps.InfoWindow();
      pts.forEach((s, idx) => {
        // Terminals are filled dots; intermediate stops are clean white "donuts".
        const terminal = idx === 0 || idx === pts.length - 1;
        const m = new g.maps.Marker({
          position: { lat: s.lat, lng: s.lng }, map: mapRef.current,
          icon: terminal
            ? { path: g.maps.SymbolPath.CIRCLE, scale: 6, fillColor: LINE, fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2.5 }
            : { path: g.maps.SymbolPath.CIRCLE, scale: 4, fillColor: "#ffffff", fillOpacity: 1, strokeColor: LINE, strokeWeight: 2 },
          title: s.name, zIndex: 3   // native hover tooltip
        });
        // Click marker -> popup with the stop name + a button to list all routes there.
        m.addListener("click", () => {
          const div = document.createElement("div");
          div.style.cssText = "font-size:13px;line-height:1.4";
          const title = document.createElement("div");
          title.textContent = s.name; title.style.cssText = "font-weight:600;margin-bottom:4px";
          div.appendChild(title);
          if (onStopClick) {
            const btn = document.createElement("button");
            btn.textContent = (stopActionLabel || "Routes at this stop") + " →";
            btn.style.cssText = "color:#0369a1;text-decoration:underline;cursor:pointer;background:none;border:none;padding:0;font-size:13px";
            btn.onclick = () => { infoRef.current.close(); onStopClick(s); };
            div.appendChild(btn);
          }
          infoRef.current.setContent(div);
          infoRef.current.open(mapRef.current, m);
        });
        overlays.current.push(m);
        bounds.extend({ lat: s.lat, lng: s.lng }); hasBounds = true;
      });
    }

    if (userLocation?.lat && userLocation?.lng) {
      const pos = { lat: userLocation.lat, lng: userLocation.lng };
      const accuracy = Math.max(18, Math.min(userLocation.accuracy || 40, 250));
      const circle = new g.maps.Circle({
        center: pos,
        radius: accuracy,
        map: mapRef.current,
        fillColor: "#0ea5e9",
        fillOpacity: 0.12,
        strokeColor: "#0284c7",
        strokeOpacity: 0.35,
        strokeWeight: 1,
        zIndex: 4
      });
      const marker = new g.maps.Marker({
        position: pos,
        map: mapRef.current,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#0284c7",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3
        },
        title: "Current location",
        zIndex: 1001
      });
      overlays.current.push(circle, marker);
      bounds.extend(pos);
      hasBounds = true;
    }

    if (hasBounds) mapRef.current.fitBounds(bounds);

    (vehicles || []).filter(v => v.lat && v.lng).forEach(v => {
      const heading = v.heading || 0;
      const plate = plateText(v.plate);
      const svg = busMarkerSvg(heading);
      const m = new g.maps.Marker({
        position: { lat: v.lat, lng: v.lng }, map: mapRef.current,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
          scaledSize: new g.maps.Size(58, 58),
          anchor: new g.maps.Point(29, 29),
          labelOrigin: new g.maps.Point(29, -5)
        },
        label: plate ? { text: plate, fontSize: "11px", fontWeight: "700", color: "#7c2d12", className: "cme-bus-label" } : undefined,
        title: "Bus " + (v.plate || ""), zIndex: 999
      });
      overlays.current.push(m);
    });
  }, [stops, vehicles, routePaths, userLocation, mapReady]);

  useEffect(() => {
    const g = window.google;
    if (!g || !mapRef.current) return;
    if (!dirRenderer.current) dirRenderer.current = new g.maps.DirectionsRenderer();
    dirRenderer.current.setMap(directionsResult ? mapRef.current : null);
    if (directionsResult) dirRenderer.current.setDirections(directionsResult);
  }, [directionsResult, mapReady]);

  return (
    <div className="cme-map-card relative h-full min-h-[320px] w-full overflow-hidden rounded-md bg-slate-100">
      {err && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50 text-slate-500 text-sm p-4 text-center">{err}</div>}
      <div ref={ref} className="h-full w-full"></div>
    </div>
  );
}

/* ========================= Feature 1 — Bus number ========================= */
function RouteSearch({ favs, setFavs, initialRoute, onShowStops, lang }) {
  const t = STR[lang];
  const [query, setQuery] = useState(initialRoute || "");
  const [route, setRoute] = useState(initialRoute || null);
  const [dirs, setDirs] = useState([]);
  const [etaMap, setEtaMap] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [shapes, setShapes] = useState([]); // list of { direction, paths, pts }
  const [nearStops, setNearStops] = useState([]); // live bus -> stop seq, for plate inference
  const [activeDir, setActiveDir] = useState(0);
  const [showAllBuses, setShowAllBuses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [routeHistory, setRouteHistory] = useState(() => SearchHistory.read().routes);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationErr, setLocationErr] = useState(null);
  const [nearestIdx, setNearestIdx] = useState(-1);
  const stopRefs = useRef(new Map());

  const applyEta = (items) => {
    const map = {};
    items.forEach(e => {
      const k = e.Direction + "|" + (e.StopName?.Zh_tw);
      const prev = map[k];
      if (!prev) { map[k] = e; return; }
      const eScore = hasEta(e) ? e.EstimateTime : Infinity;
      const pScore = hasEta(prev) ? prev.EstimateTime : Infinity;
      if (eScore < pScore) map[k] = e;
    });
    setEtaMap(map);
  };
  const applyVehicles = (items) => {
    setVehicles(items.map(v => ({ plate: v.PlateNumb, lat: v.BusPosition?.PositionLat, lng: v.BusPosition?.PositionLon, heading: v.Azimuth, direction: v.Direction })));
  };
  const applyNearStops = (items) => {
    setNearStops((items || [])
      .map(n => ({ direction: n.Direction, seq: n.StopSequence, plate: n.PlateNumb }))
      .filter(n => plateText(n.plate) && n.seq != null));
  };
  const refreshLive = useCallback(async (name, quiet = false) => {
    if (!name) return;
    try {
      const [eta, rt, near] = await Promise.allSettled([
        TDX.etaOfRoute(name), TDX.realtimeOfRoute(name), TDX.nearStopOfRoute(name)
      ]);
      if (eta.status === "fulfilled") applyEta(eta.value);
      if (rt.status === "fulfilled") applyVehicles(rt.value);
      if (near.status === "fulfilled" && Array.isArray(near.value)) applyNearStops(near.value);
    } catch (e) {
      if (!quiet) setErr(e.message);
    }
  }, []);

  const load = useCallback(async (name) => {
    if (!name) return;
    setRouteHistory(SearchHistory.add("routes", name).routes);
    setLoading(true); setErr(null); setRoute(name); setShapes([]); setNearStops([]);
    try {
      const sor = await TDX.stopsOfRoute(name);
      if (!sor.length) { setErr(STR[lang].noRoute + " “" + name + "”."); setDirs([]); setLoading(false); return; }
      const grouped = sor.map(d => ({
        direction: d.Direction,
        stops: (d.Stops || []).map(s => ({
          zh: s.StopName?.Zh_tw, en: s.StopName?.En, order: s.StopSequence,
          lat: s.StopPosition?.PositionLat, lng: s.StopPosition?.PositionLon
        }))
      }));
      // Routes like 265 return many sub-routes; collapse duplicates sharing the same
      // direction + origin/destination, keeping the variant with the most stops.
      const byKey = new Map();
      grouped.forEach(grp => {
        const ss = grp.stops;
        const key = grp.direction + "|" + (ss[0]?.zh || "") + ">" + (ss[ss.length - 1]?.zh || "");
        const ex = byKey.get(key);
        if (!ex || grp.stops.length > ex.stops.length) byKey.set(key, grp);
      });
      setDirs([...byKey.values()]); setActiveDir(0);
      const [eta, rt, shp, near] = await Promise.allSettled([
        TDX.etaOfRoute(name), TDX.realtimeOfRoute(name), TDX.shapeOfRoute(name), TDX.nearStopOfRoute(name)
      ]);
      if (eta.status === "fulfilled") applyEta(eta.value);
      else setEtaMap({});
      if (rt.status === "fulfilled") applyVehicles(rt.value);
      else setVehicles([]);
      if (shp.status === "fulfilled" && shp.value && shp.value.length) {
        // Keep each sub-route's geometry as its own row; the active stop list
        // later decides which branch geometry fits best.
        const rows = shp.value.map(item => {
          const paths = wktToPaths(item.Geometry);
          const pts = paths.reduce((n, p) => n + p.length, 0);
          return { direction: item.Direction, paths, pts };
        }).filter(r => r.pts > 0);
        setShapes(rows);
      } else setShapes([]);
      if (near.status === "fulfilled" && Array.isArray(near.value)) applyNearStops(near.value);
      else setNearStops([]);
    } catch (e) { setErr(e.message); setDirs([]); }
    setLoading(false);
  }, [lang]);

  useEffect(() => { if (initialRoute) load(initialRoute); }, [initialRoute, load]);
  useEffect(() => {
    if (!route || !dirs.length) return;
    const id = setInterval(() => refreshLive(route, true), 15000);
    return () => clearInterval(id);
  }, [route, dirs.length, refreshLive]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationErr(STR[lang].locationUnavailable);
      return;
    }
    setLocating(true);
    setLocationErr(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setLocating(false);
      },
      () => {
        setLocationErr(STR[lang].locationDenied);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [lang]);

  const current = dirs[activeDir];
  const stops = current ? current.stops : [];
  // Pick ONE geometry for the active branch: prefer the shape that hugs the
  // selected stop list, then use point count as a tie-breaker.
  const routePaths = (() => {
    if (!current || !shapes.length) return null;
    const sameDir = shapes.filter(r => r.direction == null || r.direction === current.direction);
    const pool = sameDir.length ? sameDir : shapes;
    const scored = pool.map(r => ({ ...r, score: scorePathsAgainstStops(r.paths, stops) }));
    const best = scored.reduce((a, b) => (b.score > a.score || (b.score === a.score && b.pts > a.pts) ? b : a), scored[0]);
    return best ? best.paths : null;
  })();
  const isVehicleNearCurrentBranch = (v) => {
    if (!current || !v?.lat || !v?.lng) return !current;
    const point = { lat: v.lat, lng: v.lng };
    if (routePaths && routePaths.length) return distanceToPathsMeters(point, routePaths) <= 450;
    return distanceToStopsMeters(point, stops) <= 700;
  };
  // TDX live feeds are route-number-wide. Keep the selected branch clean, then
  // optionally loosen only the direction check when the user asks for all buses.
  const directionVehicles = (current && !showAllBuses)
    ? vehicles.filter(v => v.direction == null || v.direction === current.direction)
    : vehicles;
  const visibleVehicles = current ? directionVehicles.filter(isVehicleNearCurrentBranch) : directionVehicles;
  const isFav = route && favs.routes.includes(route);
  const dirLabel = (d) => {
    const ss = d.stops;
    if (!ss || !ss.length) return "";
    return pickName(ss[0].zh, ss[0].en, lang) + " → " + pickName(ss[ss.length - 1].zh, ss[ss.length - 1].en, lang);
  };
  // Infer the next bus serving a stop from the live feed: nearest bus behind it
  // (highest stop-sequence ≤ this stop, same direction).
  const estimatePlate = (seq) => {
    if (!current || seq == null || !nearStops.length) return "";
    const cand = nearStops.filter(n => (n.direction == null || n.direction === current.direction) && n.seq <= seq);
    if (!cand.length) return "";
    const best = cand.reduce((a, b) => (b.seq > a.seq ? b : a), cand[0]);
    return plateText(best.plate);
  };
  const etaEntries = current ? stops.map(s => etaMap[current.direction + "|" + s.zh]).filter(hasEta) : [];
  const nextEta = etaEntries.length ? etaEntries.reduce((a, b) => (a.EstimateTime < b.EstimateTime ? a : b), etaEntries[0]) : null;
  const directionName = current ? dirLabel(current) : "—";
  const nearestStop = nearestIdx >= 0 ? stops[nearestIdx] : null;

  useEffect(() => {
    if (!userLocation || !stops.length) { setNearestIdx(-1); return; }
    const idx = nearestStopIndex(userLocation, stops);
    setNearestIdx(idx);
    if (idx >= 0) {
      requestAnimationFrame(() => {
        stopRefs.current.get(idx)?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    }
  }, [userLocation, activeDir, current?.direction, stops.length]);

  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(360px,0.92fr)_minmax(420px,1.28fr)]">
      <Panel className="flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <form onSubmit={(e) => { e.preventDefault(); load(query.trim()); }} className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <TextInput value={query} onChange={e => setQuery(e.target.value)} placeholder={t.routePh} />
            <PrimaryButton>{t.search}</PrimaryButton>
          </form>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={requestLocation}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 hover:border-sky-300 hover:bg-sky-50">
              {locating ? t.locating : (userLocation ? t.updateLocation : t.allowLocation)}
            </button>
            {nearestStop && (
              <span className="min-w-0 truncate rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                {t.nearestStop}: {pickName(nearestStop.zh, nearestStop.en, lang)}
              </span>
            )}
            {locationErr && <span className="text-xs font-medium text-rose-600">{locationErr}</span>}
          </div>
          <HistoryChips label={t.history} items={routeHistory} onPick={(item) => { setQuery(item); load(item); }} />

          {route && !loading && dirs.length > 0 && (
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase text-slate-500">{t.activeRoute}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="truncate text-3xl font-semibold leading-none text-slate-900">{route}</span>
                  <StarButton active={isFav} onClick={() => setFavs(Favorites.toggleRoute(route))} />
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <button onClick={() => load(route)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-teal-700 hover:border-teal-300">{t.refresh}</button>
                <span className="text-[10px] font-semibold uppercase text-slate-400">{t.autoRefresh}</span>
              </div>
            </div>
          )}

          {route && !loading && dirs.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric label={t.stopsMetric} value={stops.length || "—"} tone="teal" />
              <Metric label={t.vehiclesMetric} value={visibleVehicles.length || 0} tone="amber" />
              <Metric label={t.now} value={nextEta ? etaLabel(nextEta, lang) : "—"} tone={nextEta ? "rose" : "slate"} />
            </div>
          )}

          {dirs.length > 1 && (
            <div className="cme-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
              {dirs.map((d, i) => (
                <GhostButton key={i} onClick={() => setActiveDir(i)} active={i === activeDir} className="max-w-[260px] shrink-0 truncate text-xs">
                  {dirLabel(d)}
                </GhostButton>
              ))}
            </div>
          )}

          {route && !loading && vehicles.length > 0 && (
            <label className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer select-none">
              <input className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-200" type="checkbox" checked={showAllBuses} onChange={e => setShowAllBuses(e.target.checked)} />
              {t.showAll}
            </label>
          )}

          <div className="mt-3 space-y-2">
            {loading && <Spinner label={t.fetching} />}
            {err && <ErrorNote>{err}</ErrorNote>}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {!route && !loading && (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">{t.noRouteLoaded}</div>
          )}
          {stops.length > 0 && (
            <div className="cme-route-stop-scroll cme-scroll h-full overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-3 py-2 sm:px-4 sm:py-3">
                <div className="text-xs font-semibold uppercase text-slate-500">{t.departures}</div>
                <div className="max-w-[70%] truncate text-xs text-slate-400">{directionName}</div>
              </div>
              <div className="divide-y divide-slate-100">
                {stops.map((s, i) => {
                  const e = current ? etaMap[current.direction + "|" + s.zh] : null;
                  const confirmed = e && plateText(e.PlateNumb);
                  const estimated = confirmed ? "" : estimatePlate(s.order);
                  const isNearest = i === nearestIdx;
                  return (
                    <div key={i} ref={(el) => { if (el) stopRefs.current.set(i, el); else stopRefs.current.delete(i); }}
                      className={"grid grid-cols-[28px_minmax(0,1fr)_auto] gap-2 px-3 py-2 sm:grid-cols-[34px_minmax(0,1fr)_auto] sm:gap-3 sm:px-4 sm:py-3 " + (isNearest ? "bg-sky-50 ring-1 ring-inset ring-sky-200" : "hover:bg-teal-50/45")}>
                      <div className="flex flex-col items-center">
                        <span className={"grid h-6 w-6 place-items-center rounded-full border bg-white text-[10px] font-semibold sm:h-7 sm:w-7 sm:text-[11px] " + (isNearest ? "border-sky-300 text-sky-800" : "border-teal-200 text-teal-800")}>{s.order}</span>
                        {i < stops.length - 1 && <span className="cme-route-rail mt-1 h-full min-h-4 w-0.5 rounded-full sm:min-h-6"></span>}
                      </div>
                      <button className="min-w-0 text-left" onClick={() => onShowStops && onShowStops(s.zh)} title={s.zh}>
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-xs font-semibold text-slate-800 hover:text-teal-700 sm:text-sm">{pickName(s.zh, s.en, lang)}</span>
                          {isNearest && <span className="shrink-0 rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-700">{t.nearestStop}</span>}
                        </div>
                        <div className="mt-0.5 min-h-[12px] text-[10px] font-mono text-slate-400 sm:mt-1 sm:min-h-[14px] sm:text-[11px]">
                          {confirmed ? e.PlateNumb : (estimated ? "~" + estimated : "")}
                        </div>
                      </button>
                      <div className="flex items-start justify-end">
                        <EtaPill entry={e} lang={lang} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Panel>

      <Panel className="flex min-h-[420px] flex-col overflow-hidden p-2 xl:min-h-0">
        <div className="flex items-center justify-between px-2 pb-2">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500">{t.map}</div>
            <div className="text-sm font-semibold text-slate-800">{routePaths ? t.routeLine : t.liveBoard}</div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">{visibleVehicles.length} {t.vehiclesMetric}</div>
        </div>
        <div className="min-h-[340px] flex-1">
          <MapPanel stops={stops.map(s => ({ ...s, name: pickName(s.zh, s.en, lang) }))} vehicles={visibleVehicles} routePaths={routePaths}
            onStopClick={(s) => onShowStops && onShowStops(s.zh)} stopActionLabel={t.viewRoutes} userLocation={userLocation} />
        </div>
      </Panel>
    </div>
  );
}

/* ========================= Feature 2 — Stop ========================= */
function StopSearch({ favs, setFavs, onShowRoute, lang, initialStop }) {
  const t = STR[lang];
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null); // { zh, en }
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [stopHistory, setStopHistory] = useState(() => SearchHistory.read().stops);

  async function runSearch(q) {
    if (!q) return;
    setStopHistory(SearchHistory.add("stops", q).stops);
    setLoading(true); setErr(null); setSelected(null); setArrivals([]);
    try {
      let uniq = [];
      try {
        // Smart match over the full cached stop list (handles 北車, 安森, 大森公, 台/臺, English).
        const index = await TDX.loadStopIndex();
        uniq = matchStops(index, q);
      } catch (idxErr) {
        // Fallback: direct server query if the index can't be loaded.
        const stops = await TDX.findStops(q);
        const seen = new Set();
        stops.forEach(s => { const zh = s.StopName?.Zh_tw; if (zh && !seen.has(zh)) { seen.add(zh); uniq.push({ zh, en: s.StopName?.En }); } });
      }
      setMatches(uniq);
      if (!uniq.length) setErr(STR[lang].noStopMatch + " “" + q + "”.");
    } catch (e) { setErr(e.status === 429 ? STR[lang].rateLimited : e.message); }
    setLoading(false);
  }
  async function search(e) {
    e && e.preventDefault();
    runSearch(query.trim());
  }

  const loadArrivals = useCallback(async (obj, quiet = false) => {
    if (!obj?.zh) return;
    if (!quiet) { setLoading(true); setErr(null); setArrivals([]); }
    try {
      const eta = await TDX.etaAtStop(obj.zh);
      const byRoute = {};
      eta.forEach(e => {
        const r = e.RouteName?.Zh_tw; if (!r) return;
        if (!byRoute[r] || (e.EstimateTime ?? 1e9) < (byRoute[r].EstimateTime ?? 1e9)) byRoute[r] = e;
      });
      setArrivals(Object.values(byRoute).sort((a, b) => (a.EstimateTime ?? 1e9) - (b.EstimateTime ?? 1e9)));
    } catch (e) {
      if (!quiet) setErr(e.status === 429 ? STR[lang].rateLimited : e.message);
    }
    if (!quiet) setLoading(false);
  }, [lang]);

  const pick = useCallback(async (stop) => {
    const obj = typeof stop === "string" ? { zh: stop } : stop;
    if (obj.zh) setStopHistory(SearchHistory.add("stops", obj.zh).stops);
    setSelected(obj);
    loadArrivals(obj);
  }, [loadArrivals]);

  // Auto-open the stop when navigated here from a route's stop list.
  useEffect(() => { if (initialStop) pick(initialStop); }, [initialStop, pick]);
  useEffect(() => {
    if (!selected?.zh) return;
    const id = setInterval(() => loadArrivals(selected, true), 15000);
    return () => clearInterval(id);
  }, [selected, loadArrivals]);

  const isFav = selected && favs.stops.includes(selected.zh);

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(300px,0.78fr)_minmax(360px,1.22fr)]">
      <Panel className="flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase text-slate-500">{t.stopPanel}</div>
          <form onSubmit={search} className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <TextInput value={query} onChange={e => setQuery(e.target.value)} placeholder={t.stopPh} />
            <PrimaryButton>{t.search}</PrimaryButton>
          </form>
          <HistoryChips label={t.history} items={stopHistory} onPick={(item) => { setQuery(item); runSearch(item); }} />
          <div className="mt-3 space-y-2">
            {loading && !selected && <Spinner />}
            {err && <ErrorNote>{err}</ErrorNote>}
          </div>
        </div>
        <div className="cme-scroll min-h-0 flex-1 overflow-y-auto p-3">
          {!selected && matches.length > 0 && (
            <div>
              <div className="mb-2 px-1 text-xs font-semibold uppercase text-slate-500">{t.matches}</div>
              <div className="grid gap-2">
                {matches.map((m, i) => (
                  <button key={i} onClick={() => pick(m)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50">
                    {pickName(m.zh, m.en, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {!selected && !matches.length && !loading && (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">{t.stopPh}</div>
          )}
        </div>
      </Panel>

      <Panel className="flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          {selected ? (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button onClick={() => setSelected(null)} className="mb-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-500 hover:border-teal-300 hover:text-teal-700">←</button>
                <div className="truncate text-2xl font-semibold text-slate-900">{pickName(selected.zh, selected.en, lang)}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase text-slate-400">{t.autoRefresh}</div>
              </div>
              <StarButton active={isFav} onClick={() => setFavs(Favorites.toggleStop(selected.zh))} />
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-semibold uppercase text-slate-500">{t.departures}</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">—</div>
            </div>
          )}
          {selected && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Metric label={t.routesH} value={arrivals.length} tone="teal" />
              <Metric label={t.now} value={arrivals[0] ? etaLabel(arrivals[0], lang) : "—"} tone={arrivals[0] ? "amber" : "slate"} />
            </div>
          )}
          {loading && selected && <div className="mt-3"><Spinner /></div>}
        </div>
        <div className="cme-scroll min-h-0 flex-1 overflow-y-auto">
          {selected && !loading && !arrivals.length && <div className="p-4 text-sm text-slate-500">{t.noStopArr}</div>}
          <div className="divide-y divide-slate-100">
            {arrivals.map((e, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 hover:bg-teal-50/45">
                <button onClick={() => onShowRoute(e.RouteName?.Zh_tw)} className="min-w-0 text-left">
                  <div className="truncate text-sm font-semibold text-slate-800 hover:text-teal-700">{t.routeWord} {pickName(e.RouteName?.Zh_tw, e.RouteName?.En, lang)}</div>
                  <div className="mt-1 min-h-[14px] text-[11px] font-mono text-slate-400">{plateText(e.PlateNumb)}</div>
                </button>
                <EtaPill entry={e} lang={lang} />
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ========================= Feature 3 — Plan trip ========================= */
function TripPlanner({ lang }) {
  const t = STR[lang];
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function plan(e) {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    setLoading(true); setErr(null); setResult(null); setSteps([]);
    try {
      const g = await loadGoogleMaps();
      const svc = new g.maps.DirectionsService();
      const localize = (value) => /台|臺|taipei|taiwan|new taipei|keelung/i.test(value)
        ? value
        : value + ", Taipei, Taiwan";
      const res = await new Promise((resolve, reject) => {
        svc.route({
          origin: localize(from.trim()),
          destination: localize(to.trim()),
          travelMode: g.maps.TravelMode.TRANSIT,
          transitOptions: { departureTime: new Date(Date.now() + 2 * 60 * 1000) },
          region: "TW"
        }, (routeResult, status) => {
          if (status === "OK" && routeResult) resolve(routeResult);
          else if (status === "REQUEST_DENIED") reject(new Error(STR[lang].directionsDenied));
          else if (status === "ZERO_RESULTS" || status === "NOT_FOUND") reject(new Error(STR[lang].directionsNoRoute));
          else reject(new Error("Google Directions returned " + status + "."));
        });
      });
      setResult(res);
      const legs = res.routes[0]?.legs?.[0];
      setSteps((legs?.steps || []).map(s => ({
        mode: s.travel_mode, instr: s.instructions,
        line: s.transit?.line?.short_name || s.transit?.line?.name,
        dep: s.transit?.departure_stop?.name, arr: s.transit?.arrival_stop?.name,
        dur: s.duration?.text
      })));
    } catch (e) { setErr(e.message); setLoading(false); }
    setLoading(false);
  }

  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(340px,0.82fr)_minmax(420px,1.18fr)]">
      <Panel className="flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase text-slate-500">{t.tripPanel}</div>
          <form onSubmit={plan} className="grid gap-2">
            <TextInput value={from} onChange={e => setFrom(e.target.value)} placeholder={t.fromPh} />
            <TextInput value={to} onChange={e => setTo(e.target.value)} placeholder={t.toPh} />
            <PrimaryButton className="w-full">{t.findRoutes}</PrimaryButton>
          </form>
          <div className="mt-3 space-y-2">
            {loading && <Spinner label={t.planning} />}
            {err && <ErrorNote>{err}</ErrorNote>}
          </div>
        </div>
        <div className="cme-scroll min-h-0 flex-1 overflow-y-auto p-3">
          <div className="grid gap-2">
            {steps.map((s, i) => (
              <div key={i} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 rounded-md border border-slate-200 bg-white px-3 py-3">
                <span className={"grid h-8 w-8 place-items-center rounded-md text-xs font-bold " + (s.mode === "WALKING" ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800")}>
                  {s.mode === "WALKING" ? "W" : "T"}
                </span>
                <div className="min-w-0">
                  {s.line
                    ? <div className="truncate text-sm font-semibold text-slate-800">{s.mode === "WALKING" ? t.walk : t.take + " " + s.line}</div>
                    : <div className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: s.instr }} />}
                  {s.dep && <div className="mt-1 truncate text-xs text-slate-500">{s.dep} → {s.arr}</div>}
                  {s.dur && <div className="mt-1 text-xs font-medium text-slate-400">{s.dur}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="flex min-h-[420px] flex-col overflow-hidden p-2 xl:min-h-0">
        <div className="flex items-center justify-between px-2 pb-2">
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500">{t.map}</div>
            <div className="text-sm font-semibold text-slate-800">{t.tripPanel}</div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">{steps.length} {t.routesH}</div>
        </div>
        <div className="min-h-[340px] flex-1">
          <MapPanel directionsResult={result} />
        </div>
      </Panel>
    </div>
  );
}

/* ========================= Ambient wait game ========================= */
function AmbientWaitGame({ lang }) {
  const t = STR[lang];
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);
  const bestKey = "cme_wait_game_best_v1";
  const initialBest = () => {
    try { return Number(localStorage.getItem(bestKey)) || 0; } catch { return 0; }
  };
  const stateRef = useRef({
    phase: "waiting", score: 0, streak: 0, best: initialBest(),
    stickX: 50, stickY: -14, trayX: 50, velocity: 0.01, angle: 0, last: 0, flash: ""
  });
  const [view, setView] = useState(() => ({ ...stateRef.current }));

  const publish = () => setView({ ...stateRef.current });

  const setTrayFromClient = (clientX) => {
    const width = window.innerWidth || 1;
    stateRef.current.trayX = Math.max(8, Math.min(92, (clientX / width) * 100));
    publish();
  };

  const queueRound = (delay = 2400 + Math.random() * 5200) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => startRound(), delay);
  };

  const finishRound = (caught) => {
    const s = stateRef.current;
    s.phase = caught ? "caught" : "missed";
    s.flash = caught ? t.gameCaught : t.gameMissed;
    if (caught) {
      s.score += 1;
      s.streak += 1;
      s.best = Math.max(s.best, s.score);
      try { localStorage.setItem(bestKey, String(s.best)); } catch {}
    } else {
      s.streak = 0;
    }
    publish();
    queueRound(caught ? 1800 + Math.random() * 2600 : 2400 + Math.random() * 3600);
  };

  const loop = (now) => {
    const s = stateRef.current;
    const dt = Math.min(40, now - (s.last || now));
    s.last = now;
    if (s.phase === "falling") {
      s.velocity += 0.0000012 * dt;
      s.stickY += s.velocity * dt;
      s.angle += Math.sin(now / 260) * 0.07;
      if (s.stickY >= 88) {
        finishRound(Math.abs(s.stickX - s.trayX) <= 10);
        return;
      }
      publish();
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  const startRound = () => {
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    s.phase = "falling";
    s.flash = "";
    s.stickX = 12 + Math.random() * 76;
    s.stickY = -14;
    s.velocity = 0.0085 + Math.random() * 0.003 + Math.min(s.score, 12) * 0.00018;
    s.angle = -10 + Math.random() * 20;
    s.last = performance.now();
    publish();
    rafRef.current = requestAnimationFrame(loop);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timeoutRef.current);
    stateRef.current = { ...stateRef.current, phase: "waiting", score: 0, streak: 0, stickY: -14, velocity: 0.01, flash: "" };
    publish();
    queueRound(900);
  };

  useEffect(() => {
    const move = (e) => setTrayFromClient(e.clientX);
    const touchMove = (e) => {
      const touch = e.touches && e.touches[0];
      if (touch) setTrayFromClient(touch.clientX);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: true });
    queueRound(700 + Math.random() * 1300);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("touchmove", touchMove);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const flashTone = view.phase === "caught"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute h-24 w-3 origin-center rounded-full bg-gradient-to-b from-amber-700 via-amber-500 to-amber-800 shadow-lg"
        style={{ left: view.stickX + "vw", top: view.stickY + "vh", transform: `translate(-50%, -50%) rotate(${view.angle}deg)`, opacity: view.phase === "waiting" ? 0 : 1 }}>
      </div>

      {view.flash && (
        <div
          className={"absolute rounded-md border px-2 py-1 text-xs font-semibold shadow-sm " + flashTone}
          style={{ left: view.stickX + "vw", top: "calc(" + Math.min(82, Math.max(8, view.stickY)) + "vh - 32px)", transform: "translateX(-50%)" }}>
          {view.flash}
        </div>
      )}

      <div
        className="pointer-events-auto absolute bottom-4 w-36 touch-none select-none"
        style={{ left: view.trayX + "vw", transform: "translateX(-50%)" }}
        onPointerDown={(e) => setTrayFromClient(e.clientX)}
        onPointerMove={(e) => setTrayFromClient(e.clientX)}>
        <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-1 rounded-md border border-slate-200 bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
          <span className="truncate">{t.score}: {view.score} · {t.best}: {view.best}</span>
          <button type="button" onClick={reset} title={t.reset}
            className="grid h-6 w-6 place-items-center rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-500 hover:border-teal-300 hover:text-teal-700">
            ↻
          </button>
        </div>
        <div className="h-4 rounded-full border border-teal-950 bg-teal-700 shadow-lg"></div>
      </div>
    </div>
  );
}

/* ========================= Feature 4 — Favorites ========================= */
function FavoritesView({ favs, setFavs, onShowRoute, onShowStop, lang }) {
  const t = STR[lang];
  const empty = !favs.routes.length && !favs.stops.length;
  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-2">
      <Panel className="flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase text-slate-500">{t.savedRoutes}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{favs.routes.length}</div>
        </div>
        <div className="cme-scroll min-h-0 flex-1 overflow-y-auto p-3">
          {empty && <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">{t.favEmpty}</div>}
          <div className="grid gap-2">
            {favs.routes.map(r => (
              <div key={r} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                <button onClick={() => onShowRoute(r)} className="truncate text-left text-sm font-semibold text-slate-800 hover:text-teal-700">{t.routeWord} {r}</button>
                <button onClick={() => setFavs(Favorites.toggleRoute(r))} className="grid h-8 w-8 place-items-center rounded-md text-slate-300 hover:bg-rose-50 hover:text-rose-500">✕</button>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <div className="text-[11px] font-semibold uppercase text-slate-500">{t.savedStops}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{favs.stops.length}</div>
        </div>
        <div className="cme-scroll min-h-0 flex-1 overflow-y-auto p-3">
          <div className="grid gap-2">
            {favs.stops.map(s => (
              <div key={s} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                <button onClick={() => onShowStop(s)} className="truncate text-left text-sm font-semibold text-slate-800 hover:text-teal-700">{s}</button>
                <button onClick={() => setFavs(Favorites.toggleStop(s))} className="grid h-8 w-8 place-items-center rounded-md text-slate-300 hover:bg-rose-50 hover:text-rose-500">✕</button>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ========================= App shell ========================= */
const TAB_IDS = ["route", "stop", "trip", "favs"];

function App() {
  const [tab, setTab] = useState("route");
  const [lang, setLang] = useState(() => localStorage.getItem("cme_lang") || "en");
  const [favs, setFavs] = useState(Favorites.read());
  const [routeToOpen, setRouteToOpen] = useState(null);
  const [stopToOpen, setStopToOpen] = useState(null);
  const t = STR[lang];

  const setLanguage = (l) => { setLang(l); localStorage.setItem("cme_lang", l); };
  const openRoute = (name) => { setRouteToOpen(name); setStopToOpen(null); setTab("route"); };
  const openStop = (name) => { setStopToOpen(name); setTab("stop"); };

  const tdxReady = !!CFG.TDX_API_BASE || (!!CFG.TDX_CLIENT_ID && !CFG.TDX_CLIENT_ID.startsWith("YOUR_") && !!CFG.TDX_CLIENT_SECRET && !CFG.TDX_CLIENT_SECRET.startsWith("YOUR_"));
  const mapsReady = !!CFG.GOOGLE_MAPS_API_KEY && !CFG.GOOGLE_MAPS_API_KEY.startsWith("YOUR_");
  const keysMissing = !tdxReady || !mapsReady;
  const tabTitles = { route: t.routePanel, stop: t.stopPanel, trip: t.tripPanel, favs: t.favPanel };
  const navMarks = { route: "R", stop: "S", trip: "A", favs: "★" };

  return (
    <div className="cme-shell flex min-h-screen w-full flex-col gap-3 overflow-x-hidden p-0 sm:p-4 lg:h-screen lg:flex-row lg:overflow-hidden">
      <aside className="flex w-full max-w-full shrink-0 flex-col overflow-hidden rounded-none border border-slate-900 bg-[#14211d] text-white shadow-xl sm:rounded-md lg:w-72">
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-teal-400 text-lg font-black text-slate-950">C</div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold leading-tight">{t.appName}</h1>
              <div className="mt-1 truncate text-xs font-medium text-teal-100">{CFG ? CFG.CITY_LABEL : ""} · {t.cityMode}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => setLanguage("en")} className={"rounded-md border px-3 py-2 text-sm font-semibold transition " + (lang === "en" ? "border-teal-300 bg-teal-300 text-slate-950" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10")}>EN</button>
            <button onClick={() => setLanguage("zh")} className={"rounded-md border px-3 py-2 text-sm font-semibold transition " + (lang === "zh" ? "border-teal-300 bg-teal-300 text-slate-950" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10")}>中</button>
          </div>
        </div>

        <nav className="grid gap-2 p-3 sm:grid-cols-4 lg:block lg:space-y-2">
          {TAB_IDS.map(id => (
            <button key={id} onClick={() => setTab(id)}
              className={"grid min-w-0 grid-cols-[32px_minmax(0,1fr)] items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold transition lg:w-full " + (tab === id ? "border-teal-300 bg-teal-300 text-slate-950" : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10")}>
              <span className={"grid h-8 w-8 place-items-center rounded-md text-xs " + (tab === id ? "bg-slate-950 text-white" : "bg-white/10 text-teal-100")}>{navMarks[id]}</span>
              <span className="truncate">{tabTitles[id]}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/10 p-3">
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] font-semibold uppercase text-teal-100">{t.routesH}</div>
            <div className="mt-1 text-xl font-semibold">{favs.routes.length}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] font-semibold uppercase text-teal-100">{t.stopsH}</div>
            <div className="mt-1 text-xl font-semibold">{favs.stops.length}</div>
          </div>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col gap-3">
        <header className="flex shrink-0 items-center justify-between gap-3 px-3 sm:px-0">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">{t.liveBoard}</div>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-slate-900">{tabTitles[tab]}</h2>
          </div>
          <div className="hidden rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 sm:block">
            {CFG ? CFG.CITY_LABEL : ""} · {t.subtitle}
          </div>
        </header>

        {keysMissing && (
          <div className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{t.keysMissing}</div>
        )}

        <div className="min-h-0 flex-1">
          {tab === "route" && <RouteSearch favs={favs} setFavs={setFavs} initialRoute={routeToOpen} onShowStops={openStop} lang={lang} />}
          {tab === "stop" && <StopSearch favs={favs} setFavs={setFavs} onShowRoute={openRoute} initialStop={stopToOpen} lang={lang} key={stopToOpen} />}
          {tab === "trip" && <TripPlanner lang={lang} />}
          {tab === "favs" && <FavoritesView favs={favs} setFavs={setFavs} onShowRoute={openRoute} onShowStop={openStop} lang={lang} />}
        </div>
      </main>
      <AmbientWaitGame lang={lang} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
