import { BISHOP, Chess, Color, KING, KNIGHT, PAWN, PieceSymbol, QUEEN, ROOK } from 'chess.js'


// Just plays a random game of chess
// based on https://github.com/jhlywa/chess.js example code

const pieceValues: Record<PieceSymbol, number> = {
    [PAWN]: 1,
    [BISHOP]: 3,
    [KNIGHT]: 3,
    [ROOK]: 5,
    [QUEEN]: 9,
    [KING]: 0,
}

class Algorithm {
    public decideMove(chess: Chess) {
        const moves = chess.moves() // Get moves
        const move = moves[Math.floor(Math.random() * moves.length)] // decide move randomly
        chess.move(move) // make the move
    }
    private getWinningSide(chess: Chess, pieceValues: Record<PieceSymbol, number>): number {
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
}
const chess = new Chess()
const algorithm = new Algorithm



while (!chess.isGameOver()) {
    algorithm.decideMove(chess)
}

console.log(chess.pgn())