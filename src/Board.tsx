
import { Chess, type Square } from "chess.js";
import { useMemo, useState } from "react";

const glyph: Record<string, string> = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟"
};

type Props = {
  game: Chess;
  onMove?: (from: string, to: string, promotion?: string) => void;
  interactive?: boolean;
  flipped?: boolean;
  lastMove?: { from: string; to: string } | null;
  coordinates?: boolean;
};

export default function Board({
  game,
  onMove,
  interactive = true,
  flipped = false,
  lastMove = null,
  coordinates = true
}: Props) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  const files: Square[] = (
    flipped ? "hgfedcba" : "abcdefgh"
  ).split("") as Square[];

  const ranks = flipped
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1];

  const targets = useMemo(() => {
    if (!selected) return [];

    return game.moves({
      square: selected,
      verbose: true
    }).map(move => move.to);
  }, [selected, game.fen()]);

  const choose = (sq: Square) => {
    if (!interactive || game.isGameOver()) return;

    const piece = game.get(sq);

    if (selected && targets.includes(sq)) {
      const moving = game.get(selected);

      if (
        moving?.type === "p" &&
        (sq.endsWith("8") || sq.endsWith("1"))
      ) {
        setPromotion({ from: selected, to: sq });
        return;
      }

      onMove?.(selected, sq);
      setSelected(null);
      return;
    }

    if (piece && piece.color === game.turn()) {
      setSelected(sq);
    } else {
      setSelected(null);
    }
  };

  const promote = (piece: string) => {
    if (promotion) {
      onMove?.(promotion.from, promotion.to, piece);
    }

    setPromotion(null);
    setSelected(null);
  };

  return (
    <div className="board-shell">
      <div
        className="chessboard"
        role="grid"
        aria-label="Interactive chessboard"
      >
        {ranks.map(rank =>
          files.map(file => {
            const sq = `${file}${rank}` as Square;
            const p = game.get(sq);

            const light =
              (files.indexOf(file) + ranks.indexOf(rank)) % 2 === 0;

            const isTarget = targets.includes(sq);
            const isLast =
              lastMove?.from === sq || lastMove?.to === sq;

            return (
              <button
                type="button"
                role="gridcell"
                aria-label={`${sq}${
                  p
                    ? `, ${p.color === "w" ? "White" : "Black"} ${p.type}`
                    : ""
                }`}
                key={sq}
                onClick={() => choose(sq)}
                className={`square ${light ? "light" : "dark"} ${
                  selected === sq ? "selected" : ""
                } ${isLast ? "last" : ""} ${
                  isTarget ? "target" : ""
                } ${isTarget && p ? "capture" : ""}`}
              >
                {coordinates && file === files[0] && (
                  <span className="coord rank">{rank}</span>
                )}

                {coordinates && rank === ranks[ranks.length - 1] && (
                  <span className="coord file">{file}</span>
                )}

                {p && (
                  <span
                    className={`piece ${
                      p.color === "w" ? "white-piece" : "black-piece"
                    }`}
                  >
                    {glyph[p.color + p.type]}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {promotion && (
        <div className="promotion">
          <span>Promote pawn</span>

          {["q", "r", "b", "n"].map(piece => (
            <button
              key={piece}
              onClick={() => promote(piece)}
            >
              {glyph[(game.turn() === "w" ? "w" : "b") + piece]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
