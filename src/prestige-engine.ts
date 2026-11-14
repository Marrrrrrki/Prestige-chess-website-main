
import { Chess, type Move } from "chess.js";

export type EngineLevel = "beginner" | "casual" | "club" | "master";

const VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 335,
  r: 500,
  q: 900,
  k: 20000
};

const DEPTH: Record<EngineLevel, number> = {
  beginner: 1,
  casual: 2,
  club: 3,
  master: 4
};

function evaluate(game: Chess): number {
  if (game.isCheckmate()) return -100000;
  if (game.isDraw()) return 0;

  const board = game.board();
  let score = 0;
  const bishops = { w: 0, b: 0 };

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;

      const sign = piece.color === "w" ? 1 : -1;
      const distance =
        Math.abs(3.5 - file) + Math.abs(3.5 - rank);
      const central = Math.round((7 - distance) * 4);

      score += sign * VALUES[piece.type];

      if (piece.type === "n") score += sign * central * 1.5;
      if (piece.type === "b") {
        score += sign * central * 0.7;
        bishops[piece.color]++;
      }

      if (piece.type === "p") {
        const advance = piece.color === "w" ? 6 - rank : rank - 1;
        score += sign * advance * 9;
        if (file >= 2 && file <= 5) score += sign * 5;
      }

      if (piece.type === "k" && game.history().length > 20) {
        score -= sign * central * 2;
      }
    }
  }

  if (bishops.w >= 2) score += 28;
  if (bishops.b >= 2) score -= 28;

  score += (game.turn() === "w" ? 1 : -1) *
    game.moves().length * 2;

  return game.turn() === "w" ? score : -score;
}

function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    const score = (m: Move) => {
      let value = m.captured
        ? VALUES[m.captured] * 10 - VALUES[m.piece]
        : 0;

      if (m.promotion) value += VALUES[m.promotion];
      if (m.san.includes("+")) value += 40;
      if (m.san.includes("#")) value += 100000;

      return value;
    };

    return score(b) - score(a);
  });
}

function search(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number
): number {
  if (depth <= 0 || game.isGameOver()) {
    return evaluate(game);
  }

  const moves = orderMoves(game.moves({ verbose: true }));

  if (!moves.length) return evaluate(game);

  let best = -Infinity;

  for (const move of moves) {
    game.move(move);

    const score = -search(
      game,
      depth - 1,
      -beta,
      -alpha
    );

    game.undo();

    best = Math.max(best, score);
    alpha = Math.max(alpha, score);

    if (alpha >= beta) break;
  }

  return best;
}

export function choosePrestigeMove(
  fen: string,
  level: EngineLevel = "club"
): string | null {
  const game = new Chess(fen);
  const moves = orderMoves(game.moves({ verbose: true }));

  if (!moves.length) return null;

  const depth = DEPTH[level];
  let bestMove: Move | null = null;
  let bestScore = -Infinity;
  let alpha = -Infinity;

  for (const move of moves) {
    game.move(move);

    const score = -search(
      game,
      depth - 1,
      -Infinity,
      -alpha
    );

    game.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    alpha = Math.max(alpha, score);
  }

  return bestMove?.san ?? null;
}
