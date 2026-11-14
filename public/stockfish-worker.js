
const STOCKFISH_CDN =
  "https://unpkg.com/stockfish@19.0.1/bin/";

self.Module = {
  locateFile: (path) => STOCKFISH_CDN + path
};

importScripts(
  STOCKFISH_CDN + "stockfish-19-lite-single.js"
);
