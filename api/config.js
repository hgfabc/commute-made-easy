module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");

  const config = {
    TDX_API_BASE: process.env.TDX_API_BASE || "/api/tdx",
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
    CITY: process.env.CITY || "Taipei",
    CITY_LABEL: process.env.CITY_LABEL || "Taipei",
    DEFAULT_CENTER: {
      lat: Number(process.env.DEFAULT_CENTER_LAT || 25.0478),
      lng: Number(process.env.DEFAULT_CENTER_LNG || 121.5170)
    }
  };

  res.status(200).send("window.APP_CONFIG = Object.assign({}, window.APP_CONFIG || {}, " + JSON.stringify(config) + ");");
};
