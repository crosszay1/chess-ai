import { BISHOP, Chess, KING, KNIGHT, PAWN, PieceSymbol, QUEEN, ROOK } from 'chess.js'
import { inflate } from 'node:zlib'

const pieceValues: Record<PieceSymbol, number> = {
    [PAWN]: 1,
    [BISHOP]: 3,
    [KNIGHT]: 3,
    [ROOK]: 5,
    [QUEEN]: 9,
    [KING]: 9999, // Set this super high so minimax really prefers it
}

class Algorithm {
    public decideMove(chess: Chess) {
        const moves = chess.moves()
        let bestMove = moves[0]
        const isWhite = chess.turn() === 'w'
        let bestScore = isWhite ? Infinity : -Infinity

        for (const move of moves) {
            chess.move(move)
            const maxOrMini = chess.turn() === 'w' // true if white turn, false if black turn
            const currentScore = this.miniMax(chess, 1, maxOrMini) //depth 1, pass in the turn boolean
            chess.undo()
            

            if (isWhite && currentScore > bestScore) { // White's turn
                bestScore = currentScore
                bestMove = move
            } else if (!isWhite && currentScore < bestScore) { // Black's turn
                bestScore = currentScore
                bestMove = move
            }
        }

        if (bestMove) {
            chess.move(bestMove) // Actually make the move
        }
    }
    public getWinningSide(chess: Chess, pieceValues: Record<PieceSymbol, number>): number {
        let white = 0
        let black = 0
          for (const row of chess.board()) {
            for (const piece of row) {
            if (!piece) continue;

            if (piece.color === 'w') {
                white += pieceValues[piece.type];
            } else {
                black += pieceValues[piece.type];
            }
            }
        }
        return white-black // Negative, means black is winning, positive means white is winning, and the absolute value is by how much
    }
    private miniMax(chess: Chess, depth: number, isMax: boolean): number {
        if (depth == 0 || chess.isGameOver()) {
            if (chess.isDraw()) {
                return 0
            }
            return this.getWinningSide(chess, pieceValues)
        }
        const moves = chess.moves()
        

        if (isMax) { // If we are playing at the max player
            let bestScore = -Infinity
            for (const move of moves) {
                chess.move(move) // Make the move
                const currentScore = this.miniMax(chess, depth - 1, false); // Call back into minimax function to continue down the tree. Input depth -1 so eventually we'll reach a state in which depth == 0 (end)
                chess.undo() // Undo move

                bestScore = Math.max(bestScore, currentScore)
            }
            return bestScore
        }
        else {
            // Pretty much just opposite what we did before
            let bestScore = Infinity
            for (const move of moves) {
                chess.move(move) // Make the move
                const currentScore = this.miniMax(chess, depth - 1, true); // Call back into minimax function to continue down the tree. Input depth -1 so eventually we'll reach a state in which depth == 0 (end)
                chess.undo()

                bestScore = Math.min(bestScore, currentScore) // This is the difference between: best = minimum, or best = maximum
            }
            return bestScore
        }
        
    }
}
const chess = new Chess()
const algorithm = new Algorithm()



while (!chess.isGameOver()) {
    algorithm.decideMove(chess)
    console.log(`Current score: ${algorithm.getWinningSide(chess, pieceValues)}`)
}

console.log(chess.pgn())