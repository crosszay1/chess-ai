import { Chess } from 'chess.js'
import { Algorithm, pieceValues } from './algorithm.js'

const chess = new Chess()
const algorithm = new Algorithm()

while (!chess.isGameOver()) {
  const move = algorithm.decideMove(chess)
  if (move) {
    chess.move(move)
  }
  console.log(`Current score: ${algorithm.evaluateBoard(chess, pieceValues)}`)
  console.log(`Moves so far: ${chess.pgn()}`)
}

console.log(chess.pgn())
