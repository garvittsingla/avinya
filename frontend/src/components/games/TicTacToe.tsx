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

function TicTacToe({ username,  sendGameState, gameState, onBack }: TicTacToeProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  console.log(roomslug)

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
          width: '90px',
          height: '90px',
          fontSize: '48px',
          fontWeight: 'bold',
          background: value 
            ? '#d4a574'
            : '#e8c4a0',
          border: '4px solid #8b6f47',
          borderRadius: '4px',
          cursor: opponent && playerSymbol && !board[index] && !winner ? 'pointer' : 'default',
          color: value === 'X' ? '#d9534f' : '#5cb85c',
          textShadow: value ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
          transition: 'all 0.15s ease',
          boxShadow: value ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'inset 0 -2px 4px rgba(0,0,0,0.1)',
          fontFamily: 'monospace'
        }}
        onMouseEnter={(e) => {
          if (!board[index] && !winner && opponent && playerSymbol) {
            e.currentTarget.style.background = '#f5d5b0';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!board[index]) {
            e.currentTarget.style.background = '#e8c4a0';
            e.currentTarget.style.transform = 'scale(1)';
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
      gap: '24px',
      padding: '20px',
      background: 'linear-gradient(180deg, #f4d8b8 0%, #e8c4a0 100%)',
      borderRadius: '12px',
      border: '6px solid #8b6f47',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      minHeight: '600px',
      overflowY: 'hidden'
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
            background: '#d4a574',
            border: '3px solid #8b6f47',
            borderRadius: '6px',
            padding: '10px 20px',
            color: '#3d2f1f',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 3px 0 #6d5437',
            transition: 'all 0.1s ease'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = '0 1px 0 #6d5437';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 3px 0 #6d5437';
          }}
        >
          ← Back
        </button>
        <h2 style={{
          fontSize: '32px',
          color: '#3d2f1f',
          textShadow: '2px 2px 0 rgba(255,255,255,0.5)',
          fontWeight: 'bold',
          letterSpacing: '2px',
          fontFamily: 'monospace'
        }}>
          TIC TAC TOE
        </h2>
        <div style={{ width: '100px' }} />
      </div>

      {/* Game status */}
      <div style={{
        padding: '20px 32px',
        background: '#d4a574',
        borderRadius: '8px',
        border: '4px solid #8b6f47',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
        minWidth: '350px',
        textAlign: 'center'
      }}>
        {!opponent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              color: '#5d4a37', 
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Waiting for opponent...
            </p>
            <button
              onClick={handleJoinGame}
              style={{
                background: '#d9534f',
                border: '3px solid #a94442',
                borderRadius: '6px',
                padding: '12px 28px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 0 #8b3a39',
                transition: 'all 0.1s ease'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = '0 2px 0 #8b3a39';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 0 #8b3a39';
              }}
            >
              Join Game
            </button>
          </div>
        ) : winner ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              color: winner === 'draw' ? '#f0ad4e' : (winner === playerSymbol ? '#5cb85c' : '#d9534f'),
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '12px',
              textShadow: '2px 2px 0 rgba(0,0,0,0.2)'
            }}>
              {winner === 'draw' ? "🤝 It's a Draw!" : (winner === playerSymbol ? '🎉 You Win!' : '😢 You Lose!')}
            </p>
            <button
              onClick={handleReset}
              style={{
                background: '#5cb85c',
                border: '3px solid #4cae4c',
                borderRadius: '6px',
                padding: '10px 24px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 0 #3d8b3d',
                transition: 'all 0.1s ease'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = '0 2px 0 #3d8b3d';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 0 #3d8b3d';
              }}
            >
              Play Again
            </button>
          </div>
        ) : (
          <p style={{ 
            color: isMyTurn ? '#3d8b3d' : '#5d4a37',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {isMyTurn ? "🎮 Your turn!" : `⏳ Waiting for ${opponent}...`}
            <span style={{ 
              marginLeft: '12px', 
              color: playerSymbol === 'X' ? '#d9534f' : '#5cb85c',
              fontSize: '16px'
            }}>
              (You: {playerSymbol})
            </span>
          </p>
        )}
      </div>

      {/* Game board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        padding: '20px',
        background: '#c89968',
        borderRadius: '8px',
        border: '6px solid #8b6f47',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
      }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderCell(i))}
      </div>

      {/* Players info */}
      {opponent && (
        <div style={{
          display: 'flex',
          gap: '32px',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '12px 24px',
          background: '#d4a574',
          borderRadius: '8px',
          border: '3px solid #8b6f47'
        }}>
          <span style={{ color: '#d9534f' }}>❌ {playerSymbol === 'X' ? username : opponent}</span>
          <span style={{ color: '#5cb85c' }}>⭕ {playerSymbol === 'O' ? username : opponent}</span>
        </div>
      )}
    </div>
  );
}

export default TicTacToe;