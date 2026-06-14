# Commute Made Easy — Taipei Bus Tracker

A zero-build React + Tailwind web app for tracking Taipei city buses in real time.
The interface is organized as a transit control surface: a persistent command rail,
live route/stop boards, and a large map workspace.

## Features
- **Bus number** — search a route → see a dispatcher-style departure board, live ETAs per stop, the real road-following route line with direction arrows, and live bus positions. Live ETAs and bus positions refresh every 15 seconds. Direction tabs are labelled origin→destination. By default only the selected direction's buses show; a checkbox reveals opposite-direction buses. Click any stop dot on the map for its name + a "routes at this stop" button.
- **Stop** — smart search that handles abbreviations (北車, 安森, 大森公), 台/臺 spelling, and English. Pick a stop → a live departures board for every route serving it; tap a route to jump to it. Selected stop arrivals refresh every 15 seconds. Edit `STOP_ALIASES` in index.html to add your own nicknames.
- **Plan trip** — A→B public-transit directions with a matching map workspace (via Google Directions).
- **Wait game** — a tiny one-thumb catching game for killing time while waiting for a bus.
- **Favorites** — star routes and stops; the saved view becomes a launchpad back into live route/stop boards.
- **Bilingual** — EN / 中 toggle (top-right) switches all chrome and stop/route names; remembered across sessions.

## Setup (local-only)
1. Copy `config.example.js` to `config.js`.
2. **TDX key (required for local direct mode):** register free at https://tdx.transportdata.tw/ → Member Center → copy your **Client Id** and **Client Secret**.
3. **Google Maps key:** https://console.cloud.google.com/ → enable **Maps JavaScript API** and **Directions API** → create an API key.
4. Paste the values into `config.js`. This file is ignored by git and must not be published.

## Run
Just open `index.html` in a browser (double-click it). No install, no terminal.

> Tip: if anything looks blank, open the browser console (F12) — the app surfaces auth/key errors there and on screen.

## Public beta deploy
Do **not** publish `config.js`. It contains private TDX credentials.

The repo includes Vercel-compatible serverless endpoints:
- `api/tdx.js` — server-side TDX proxy. TDX Client Secret stays in Vercel environment variables.
- `api/config.js` — publishes safe browser config at runtime.

Recommended beta path:
1. Push this repo to GitHub.
2. Import the GitHub repo into Vercel.
3. Add these Vercel environment variables:
   - `TDX_CLIENT_ID`
   - `TDX_CLIENT_SECRET`
   - `GOOGLE_MAPS_API_KEY`
   - `CITY` = `Taipei`
   - `CITY_LABEL` = `Taipei`
4. Restrict the Google Maps browser key in Google Cloud to your Vercel domain, plus any local test origins you use.
5. Deploy. The app will use `/api/tdx` instead of browser-side TDX credentials.

## Notes
- `config.js` is for local-only development and is ignored by git.
- Public deploys should use the included backend proxy so the TDX secret is never exposed in the browser.
- City is set to `Taipei` in `config.js` — change `CITY` to `NewTaipei` (etc.) for other regions covered by TDX.

## Files
- `index.html` — the whole app (loads React/Tailwind/Babel from CDN; app code is inlined so it runs when opened directly from disk).
- `config.example.js` — safe local config template.
- `config.js` — your local API keys + city setting. Ignored by git.
- `api/tdx.js` — serverless TDX proxy for public beta deploys.
- `api/config.js` — serverless browser config for public beta deploys.
- `app.js` — standalone copy of the app code for reference/editing. **Not loaded by `index.html`** — edit the inlined `<script>` in `index.html` if you change logic. (Kept only so the code is readable on its own.)

## Why the app code is inlined
Browsers block Babel from fetching an external `app.js` when you open `index.html`
straight from disk (`file://`), which shows a blank page. Inlining avoids that.
If you later serve the folder over `http://` (e.g. `python3 -m http.server`),
you can split it back out.
