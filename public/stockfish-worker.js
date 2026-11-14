// Single-threaded Stockfish worker. The lite WASM build works on static hosting
// (including GitHub Pages) without SharedArrayBuffer or special server headers.
const STOCKFISH_CDN = "https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/";
self.Module = {
  locateFile: (path) => path.endsWith(".wasm") ? STOCKFISH_CDN + path : path
};
importScripts(STOCKFISH_CDN + "stockfish-19-lite-single.js");
