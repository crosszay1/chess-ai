import { Chess } from 'chess.js'


// Just plays a random game of chess
// based on https://github.com/jhlywa/chess.js example code

class Algorithm {
    public decideMove(chess: Chess) {
        const moves = chess.moves() // Get moves
        const move = moves[Math.floor(Math.random() * moves.length)] // decide move randomly
        chess.move(move) // make the move

    }
}
const chess = new Chess()
const algorithm = new Algorithm

while (!chess.isGameOver()) {
    algorithm.decideMove(chess)
}

console.log(chess.pgn())