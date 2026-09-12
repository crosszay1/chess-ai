import { BISHOP, Chess, KING, KNIGHT, PAWN, PieceSymbol, QUEEN, ROOK } from 'chess.js'


// Just plays a random game of chess
// based on https://github.com/jhlywa/chess.js example code

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
        const move = this.miniMax(chess, 1, true)
        chess.move(move) // make the move
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
            return this.getWinningSide(chess, pieceValues)
        }
        const moves = chess.moves()
        let bestScore = -Infinity

        if (isMax) { // If we are playing at the max player
            for (const move of moves) {
                chess.move(move) // Make the move
                const currentScore = this.miniMax(chess, depth - 1, false); // Call back into minimax function to continue down the tree. Input depth -1 so eventually we'll reach a state in which depth == 0 (end)
                chess.undo() // Undo move

                bestScore = Math.max(bestScore, currentScore)
            }
        }
        
        return bestScore
    }
}
const chess = new Chess()
const algorithm = new Algorithm()



while (!chess.isGameOver()) {
    algorithm.decideMove(chess)
    console.log(`Current score: ${algorithm.getWinningSide(chess, pieceValues)}`)
}

console.log(chess.pgn())