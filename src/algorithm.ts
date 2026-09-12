import { BISHOP, Chess, KING, KNIGHT, PAWN, PieceSymbol, QUEEN, ROOK } from 'chess.js'

export const pieceValues: Record<PieceSymbol, number> = {
  [PAWN]: 1,
  [BISHOP]: 3,
  [KNIGHT]: 3,
  [ROOK]: 5,
  [QUEEN]: 9,
  [KING]: 9999, // Set this super high so minimax really prefers it
}

export class Algorithm {
  public decideMove(chess: Chess, depth = 3) {
    const moves = chess.moves()
    let bestMove = moves[0]
    const isWhite = chess.turn() === 'w'
    let bestScore = isWhite ? -Infinity : Infinity

    for (const move of moves) {
      chess.move(move)
      const maxOrMini = chess.turn() === 'w' // true if white turn, false if black turn
      const currentScore = this.miniMax(chess, depth, maxOrMini, -Infinity, Infinity)
      chess.undo()

      if (isWhite && currentScore > bestScore) {
        // White's turn
        bestScore = currentScore
        bestMove = move
      } else if (!isWhite && currentScore < bestScore) {
        // Black's turn
        bestScore = currentScore
        bestMove = move
      }
    }

    return bestMove
  }

  public getWinningSide(chess: Chess, values: Record<PieceSymbol, number> = pieceValues): number {
    let white = 0
    let black = 0
    for (const row of chess.board()) {
      for (const piece of row) {
        if (!piece) continue

        if (piece.color === 'w') {
          white += values[piece.type]
        } else {
          black += values[piece.type]
        }
      }
    }
    // Negative means black is winning, positive means white is winning
    return white - black
  }

  private miniMax(chess: Chess, depth: number, isMax: boolean, alpha: number, beta: number): number {
    if (depth == 0 || chess.isGameOver()) {
      if (chess.isCheckmate()) {
        return chess.turn() === 'w' ? -Infinity : Infinity
      }
      if (chess.isDraw()) {
        return 0
      }
      return this.getWinningSide(chess, pieceValues)
    }
    const moves = chess.moves()

    if (isMax) {
      // If we are playing at the max player
      let bestScore = -Infinity
      for (const move of moves) {
        chess.move(move)
        const currentScore = this.miniMax(chess, depth - 1, false, alpha, beta)
        chess.undo()

        bestScore = Math.max(bestScore, currentScore)
        alpha = Math.max(alpha, currentScore)
        if (beta <= alpha) {
          break
        }
      }
      return bestScore
    } else {
      // Pretty much just opposite what we did before
      let bestScore = Infinity
      for (const move of moves) {
        chess.move(move)
        const currentScore = this.miniMax(chess, depth - 1, true, alpha, beta)
        chess.undo()

        bestScore = Math.min(bestScore, currentScore)
        beta = Math.min(beta, currentScore)
        if (beta <= alpha) {
          break
        }
      }
      return bestScore
    }
  }
}
