import { useState, useEffect } from 'react';

interface TicTacToeProps {
  username: string;
  roomslug: string;
  sendGameState: (gameType: string, gameData: any) => void;
  gameState: { gameType: string; gameData: any; player: string } | null;
  onBack: () => void;
}

type Player = 'X' | 'O' | null;
type Board = Player[];

function TicTacToe({ username, roomslug, sendGameState, gameState, onBack }: TicTacToeProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);

  // Handle incoming game state from other players
  useEffect(() => {
    if (gameState && gameState.gameType === 'tictactoe' && gameState.player !== username) {
      const data = gameState.gameData;
      
      if (data.action === 'join') {
        // Someone wants to play
        if (!opponent && !playerSymbol) {
          setPlayerSymbol('X');
          setOpponent(gameState.player);
          // Send confirmation
          sendGameState('tictactoe', { 
            action: 'start', 
            opponent: username,
            symbol: 'O'
          });
        }
      } else if (data.action === 'start') {
        // Game confirmed, we're player O
        if (!playerSymbol) {
          setPlayerSymbol('O');
          setOpponent(data.opponent);
        }
      } else if (data.action === 'move') {
        // Opponent made a move
        setBoard(data.board);
        setIsXNext(data.isXNext);
      } else if (data.action === 'reset') {
        // Reset the game
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
      }
    }
  }, [gameState, username, opponent, playerSymbol, sendGameState]);

  // Check for winner
  useEffect(() => {
    const checkWinner = (squares: Board): Player | null => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
      ];
      
      for (const [a, b, c] of lines) {
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return squares[a];
        }
      }
      return null;
    };

    const result = checkWinner(board);
    if (result) {
      setWinner(result);
    } else if (board.every(cell => cell !== null)) {
      setWinner('draw');
    }
  }, [board]);

  const handleClick = (index: number) => {
    // Can't play if no opponent, not your turn, cell filled, or game over
    if (!opponent || !playerSymbol) return;
    if ((isXNext && playerSymbol !== 'X') || (!isXNext && playerSymbol !== 'O')) return;
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    const newIsXNext = !isXNext;
    
    setBoard(newBoard);
    setIsXNext(newIsXNext);
    
    // Send move to other players
    sendGameState('tictactoe', {
      action: 'move',
      board: newBoard,
      isXNext: newIsXNext
    });
  };

  const handleJoinGame = () => {
    sendGameState('tictactoe', { action: 'join' });
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    sendGameState('tictactoe', { action: 'reset' });
  };

  const renderCell = (index: number) => {
    const value = board[index];
    return (
      <button
        onClick={() => handleClick(index)}
        style={{
          width: '80px',
          height: '80px',
          fontSize: '40px',
          fontWeight: 'bold',
          background: value 
            ? 'linear-gradient(145deg, #1a1a2e, #0f0f1a)'
            : 'linear-gradient(145deg, #2a2a3e, #1a1a2e)',
          border: '2px solid #3a3a4a',
          borderRadius: '8px',
          cursor: opponent && playerSymbol && !board[index] && !winner ? 'pointer' : 'default',
          color: value === 'X' ? '#e94560' : '#00ffff',
          textShadow: value ? `0 0 10px ${value === 'X' ? '#e94560' : '#00ffff'}` : 'none',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!board[index] && !winner) {
            e.currentTarget.style.background = 'linear-gradient(145deg, #3a3a4e, #2a2a3e)';
          }
        }}
        onMouseLeave={(e) => {
          if (!board[index]) {
            e.currentTarget.style.background = 'linear-gradient(145deg, #2a2a3e, #1a1a2e)';
          }
        }}
      >
        {value}
      </button>
    );
  };

  const isMyTurn = playerSymbol && ((isXNext && playerSymbol === 'X') || (!isXNext && playerSymbol === 'O'));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '10px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: '2px solid #666',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back
        </button>
        <h2 style={{
          fontSize: '24px',
          color: '#00ffff',
          textShadow: '0 0 10px #00ffff'
        }}>
          Tic Tac Toe
        </h2>
        <div style={{ width: '80px' }} />
      </div>

      {/* Game status */}
      <div style={{
        padding: '12px 24px',
        background: 'linear-gradient(145deg, #1a1a2e, #0f0f1a)',
        borderRadius: '12px',
        border: '2px solid #3a3a4a'
      }}>
        {!opponent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#888', marginBottom: '10px' }}>Waiting for opponent...</p>
            <button
              onClick={handleJoinGame}
              style={{
                background: 'linear-gradient(145deg, #e94560, #c73e54)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Join Game
            </button>
          </div>
        ) : winner ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              color: winner === 'draw' ? '#ffaa00' : (winner === playerSymbol ? '#00ff88' : '#e94560'),
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              {winner === 'draw' ? "It's a Draw!" : (winner === playerSymbol ? '🎉 You Win!' : '😢 You Lose!')}
            </p>
            <button
              onClick={handleReset}
              style={{
                marginTop: '10px',
                background: 'linear-gradient(145deg, #00ffff, #00cccc)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                color: '#000',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Play Again
            </button>
          </div>
        ) : (
          <p style={{ color: isMyTurn ? '#00ff88' : '#888' }}>
            {isMyTurn ? "Your turn!" : `Waiting for ${opponent}...`}
            <span style={{ marginLeft: '10px', color: playerSymbol === 'X' ? '#e94560' : '#00ffff' }}>
              (You: {playerSymbol})
            </span>
          </p>
        )}
      </div>

      {/* Game board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        padding: '16px',
        background: 'linear-gradient(145deg, #0a0a15, #0f0f1a)',
        borderRadius: '16px',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)'
      }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderCell(i))}
      </div>

      {/* Players info */}
      {opponent && (
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '14px'
        }}>
          <span style={{ color: '#e94560' }}>❌ {playerSymbol === 'X' ? username : opponent}</span>
          <span style={{ color: '#00ffff' }}>⭕ {playerSymbol === 'O' ? username : opponent}</span>
        </div>
      )}
    </div>
  );
}

export default TicTacToe;
