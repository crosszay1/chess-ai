import { BISHOP, Chess, KING, KNIGHT, Move, PAWN, PieceSymbol, QUEEN, ROOK } from 'chess.js'

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
    const moves = this.orderMoves(chess, chess.moves({ verbose: true }))
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
  public evaluateBoard(chess: Chess, values: Record<PieceSymbol, number> = pieceValues): number {
    const materialScore = this.getMaterialScore(chess, values)
    const mobilityScore = this.mobilityScore(chess)
    
    return materialScore + mobilityScore
  }
  private getMaterialScore(chess: Chess, values: Record<PieceSymbol, number> = pieceValues): number {
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
  private mobilityScore(chess: Chess): number {
    const turn = chess.turn()
    chess.setTurn("w") // set to white to get white moves
    const whiteMoves = chess.moves().length
    chess.setTurn("b") // set to black to get black moves
    const blackMoves = chess.moves().length
    chess.setTurn(turn) // set back to original turn

    return whiteMoves - blackMoves // If positve, white is winning, if negative, black is winning
}
  private orderMoves(chess: Chess, moves: Move[]): Move[] {
    return moves.sort((a, b) => this.moveScore(b) - this.moveScore(a))
  }
  private moveScore(move: Move): number {
    let score = 0
    if (move.captured) score += 10 * pieceValues[move.captured] - pieceValues[move.piece] // MVV-LVA
    if (move.promotion) score += pieceValues[move.promotion]
    if (move.san.includes('+')) score += 5
    return score
}

  private miniMax(chess: Chess, depth: number, isMax: boolean, alpha: number, beta: number): number {
    if (depth == 0 || chess.isGameOver()) {
      if (chess.isCheckmate()) {
        return chess.turn() === 'w' ? -Infinity : Infinity
      }
      if (chess.isDraw()) {
        return 0
      }
      return this.evaluateBoard(chess, pieceValues)
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
