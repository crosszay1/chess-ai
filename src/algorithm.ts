import { BISHOP, BLACK, Chess, KING, KNIGHT, Move, PAWN, PieceSymbol, QUEEN, ROOK, Square, WHITE } from 'chess.js'

export const pieceValues: Record<PieceSymbol, number> = {
  [PAWN]: 1,
  [BISHOP]: 3,
  [KNIGHT]: 3,
  [ROOK]: 5,
  [QUEEN]: 9,
  [KING]: 9999, // Set this super high so minimax really prefers it
}

const scoringWeights = {
  material: 1,
  mobility: 1,
  kingSafety: 1, // Set this lower because otherwise the algorithm cares too much, and doesn't develop it's pieces
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

    const whiteKingSquare = chess.findPiece({ type: KING, color: WHITE }); 
    const blackKingSquare = chess.findPiece({ type: KING, color: BLACK }); 
    const blackKingSafetyScore = this.kingSafetyScore(chess, 'b', blackKingSquare)
    const whiteKingSafetyScore = this.kingSafetyScore(chess, 'w', whiteKingSquare)

    const kingSafetyScore = whiteKingSafetyScore - blackKingSafetyScore

    return this.getWeightedScore(materialScore, mobilityScore, kingSafetyScore, scoringWeights)
  }
  private getWeightedScore(materialScore: number, mobilityScore: number, kingSafetyScore: number, weights: typeof scoringWeights): number {
    return (
      materialScore * weights.material +
      mobilityScore * weights.mobility +
      kingSafetyScore * weights.kingSafety
    )
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
    const newChess = new Chess(chess.fen()) // Create a new chess instance to mutating the original chess instance. If we set the turn many times, this triggers an incorrect threefold repetition detection and the game will be considered a draw. 
    const whiteMoves = newChess.moves().length
    newChess.setTurn("b") // set to black to get black moves
    const blackMoves = newChess.moves().length
    newChess.setTurn(turn) // set back to original turn

    return whiteMoves - blackMoves // If positve, white is winning, if negative, black is winning
  }
  private kingSafetyScore(chess: Chess, color: 'w' | 'b', kingSquare: Square[]): number {
    const square = kingSquare[0]
    if (!square) return 0

    const enemy = color === 'w' ? 'b' : 'w'
    let score = 0

    const file = square.charCodeAt(0) - 'a'.charCodeAt(0)
    const rank = Number(square[1]) - 1

    // Look at the 8 squares surrounding king
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        // Skip the king's own square
        if (df === 0 && dr === 0) continue

        const newFile = file + df
        const newRank = rank + dr

        // Off the board
        if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) {
          continue
        }

        const nearbySquare = (String.fromCharCode('a'.charCodeAt(0) + newFile) + (newRank + 1)) as Square

        const piece = chess.get(nearbySquare)

        // Nearby friendly piece bonus
        if (piece?.color === color) {
          score += 1
        }

        // Enemy piece physically near the king
        if (piece?.color === enemy) {
          score -= pieceValues[piece.type] / 3 // Value of that piece as a penalty (as a nearby queen is more threatening than a nearby pawn). Divide by 3 to make it less important. 
        }

        // Enemy attacks square near king
        if (chess.isAttacked(nearbySquare, enemy)) {
          score -= 1
        }
      }
    }

    // King checked = really bad, really big penalty
    if (chess.isAttacked(square, enemy)) {
      score -= 10
    }

    return score
  }
  private orderMoves(chess: Chess, moves: Move[]): Move[] {
    return moves.sort((a, b) => this.scoreMoves(b) - this.scoreMoves(a))
  }
  private scoreMoves(move: Move): number {
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
    const moves = chess.moves({ verbose: true })

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
