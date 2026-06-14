/* Copy this file to config.js for local-only development.
   Do not commit config.js. Public deploys should use api/config.js + env vars. */
window.APP_CONFIG = {
  // Published deploys should use the backend proxy instead of browser TDX secrets.
  // Local-only option A: leave blank and fill TDX_CLIENT_ID / TDX_CLIENT_SECRET below.
  // Local-only option B: point to a running proxy, e.g. "http://localhost:3000/api/tdx".
  TDX_API_BASE: "",

  TDX_CLIENT_ID: "YOUR_TDX_CLIENT_ID",
  TDX_CLIENT_SECRET: "YOUR_TDX_CLIENT_SECRET",

  // Browser key; restrict this in Google Cloud to your local/beta domains.
  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_BROWSER_KEY",

  CITY: "Taipei",
  CITY_LABEL: "Taipei",
  DEFAULT_CENTER: { lat: 25.0478, lng: 121.5170 }
};
