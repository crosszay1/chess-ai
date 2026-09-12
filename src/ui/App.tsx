import { useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { Algorithm, pieceValues } from '../algorithm'

const MOVE_DELAY_MS = 500
const SEARCH_DEPTH = 4

function gameStatus(chess: Chess): string {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? 'Checkmate — Black wins' : 'Checkmate — White wins'
  }
  if (chess.isStalemate()) return 'Draw — stalemate'
  if (chess.isThreefoldRepetition()) return 'Draw — threefold repetition'
  if (chess.isInsufficientMaterial()) return 'Draw — insufficient material'
  if (chess.isDraw()) return 'Draw'
  if (chess.isCheck()) return `${chess.turn() === 'w' ? 'White' : 'Black'} to move (check)`
  return `${chess.turn() === 'w' ? 'White' : 'Black'} to move`
}

export default function App() {
  const algorithmRef = useRef(new Algorithm())
  const gameRef = useRef(new Chess())
  const [fen, setFen] = useState(() => gameRef.current.fen())
  const [playing, setPlaying] = useState(true)
  const [moveCount, setMoveCount] = useState(0)

  const game = gameRef.current

  useEffect(() => {
    if (!playing) return
    if (gameRef.current.isGameOver()) {
      setPlaying(false)
      return
    }

    const timer = window.setTimeout(() => {
      const chess = gameRef.current
      const move = algorithmRef.current.decideMove(chess, SEARCH_DEPTH)
      if (!move) {
        setPlaying(false)
        return
      }
      chess.move(move)
      setFen(chess.fen())
      setMoveCount(chess.history().length)
      if (chess.isGameOver()) {
        setPlaying(false)
      }
    }, MOVE_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [playing, fen])

  const score = algorithmRef.current.getWinningSide(game, pieceValues)
  const scoreLabel =
    score > 0 ? `White +${score}` : score < 0 ? `Black +${Math.abs(score)}` : 'Even'

  function reset() {
    gameRef.current = new Chess()
    setFen(gameRef.current.fen())
    setMoveCount(0)
    setPlaying(true)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Chess AI</h1>
        <p>Watch the minimax engine play itself</p>
      </header>

      <main className="main">
        <div className="board-wrap">
          <Chessboard
            options={{
              id: 'ai-board',
              position: fen,
              allowDragging: false,
              showAnimations: true,
              animationDurationInMs: 250,
              boardStyle: {
                borderRadius: '4px',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
              },
            }}
          />
        </div>

        <aside className="panel">
          <div className="stat">
            <span className="label">Status</span>
            <span className="value">{gameStatus(game)}</span>
          </div>
          <div className="stat">
            <span className="label">Material</span>
            <span className="value">{scoreLabel}</span>
          </div>
          <div className="stat">
            <span className="label">Moves</span>
            <span className="value">{moveCount}</span>
          </div>

          <div className="actions">
            <button type="button" onClick={() => setPlaying((p) => !p)} disabled={game.isGameOver()}>
              {playing ? 'Pause' : 'Play'}
            </button>
            <button type="button" className="secondary" onClick={reset}>
              New game
            </button>
          </div>

          <pre className="pgn">{game.pgn() || 'Game will appear here…'}</pre>
        </aside>
      </main>
    </div>
  )
}
