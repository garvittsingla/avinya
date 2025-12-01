import { useState } from 'react';
//@ts-ignore
import TicTacToe from './games/TicTacToe';
//@ts-ignore

import DrawingCanvas from './games/DrawingCanvas';
//@ts-ignore

import MemoryGame from './games/MemoryGame';

interface TVPopupProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  roomslug: string;
  sendGameState: (gameType: string, gameData: any) => void;
  gameState: { gameType: string; gameData: any; player: string } | null;
}

type GameType = 'menu' | 'tictactoe' | 'drawing' | 'memory';

function TVPopup({ isOpen, onClose, username, roomslug, sendGameState, gameState }: TVPopupProps) {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  if (!isOpen) return null;

  const handleBackToMenu = () => {
    setCurrentGame('menu');
  };

  const renderGame = () => {
    switch (currentGame) {
      case 'tictactoe':
        return (
          <TicTacToe
            username={username}
            roomslug={roomslug}
            sendGameState={sendGameState}
            gameState={gameState}
            onBack={handleBackToMenu}
          />
        );
      case 'drawing':
        return (
          <DrawingCanvas
            username={username}
            roomslug={roomslug}
            sendGameState={sendGameState}
            gameState={gameState}
            onBack={handleBackToMenu}
          />
        );
      case 'memory':
        return (
          <MemoryGame
            username={username}
            onBack={handleBackToMenu}
          />
        );
      default:
        return renderMenu();
    }
  };

  const renderMenu = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '20px'
    }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#00ffff',
        textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
        marginBottom: '10px'
      }}>
        🎮 Game Station 🎮
      </h2>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Choose a game to play with others on stage!
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        width: '100%',
        maxWidth: '600px'
      }}>
        {/* Tic Tac Toe */}
        <button
          onClick={() => setCurrentGame('tictactoe')}
          style={{
            background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
            border: '2px solid #e94560',
            borderRadius: '16px',
            padding: '24px 16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 20px #e94560';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '48px' }}>⭕❌</span>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>Tic Tac Toe</span>
          <span style={{ color: '#888', fontSize: '12px' }}>2 Players</span>
        </button>

        {/* Drawing Canvas */}
        <button
          onClick={() => setCurrentGame('drawing')}
          style={{
            background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
            border: '2px solid #00ff88',
            borderRadius: '16px',
            padding: '24px 16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 20px #00ff88';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '48px' }}>🎨</span>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>Drawing</span>
          <span style={{ color: '#888', fontSize: '12px' }}>Collaborative</span>
        </button>

        {/* Memory Game */}
        <button
          onClick={() => setCurrentGame('memory')}
          style={{
            background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
            border: '2px solid #ffaa00',
            borderRadius: '16px',
            padding: '24px 16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 20px #ffaa00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '48px' }}>🧠</span>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>Memory</span>
          <span style={{ color: '#888', fontSize: '12px' }}>Single Player</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      {/* TV Frame */}
      <div style={{
        position: 'relative',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        background: 'linear-gradient(145deg, #2a2a3a, #1a1a2a)',
        borderRadius: '24px',
        padding: '8px',
        boxShadow: '0 0 60px rgba(0, 255, 255, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* TV Bezel */}
        <div style={{
          background: 'linear-gradient(180deg, #3a3a4a 0%, #2a2a3a 50%, #1a1a2a 100%)',
          borderRadius: '20px',
          padding: '20px',
          border: '3px solid #444'
        }}>
          {/* Screen */}
          <div style={{
            background: 'linear-gradient(180deg, #0a0a15 0%, #0f0f1a 100%)',
            borderRadius: '12px',
            minHeight: '400px',
            maxHeight: '70vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: 'inset 0 0 50px rgba(0, 255, 255, 0.1)',
            border: '2px solid #222'
          }}>
            {/* Scanlines effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
              pointerEvents: 'none',
              zIndex: 1
            }} />
            
            {/* Game content */}
            <div style={{ position: 'relative', zIndex: 0, padding: '20px' }}>
              {renderGame()}
            </div>
          </div>

          {/* TV Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            marginTop: '16px',
            padding: '8px'
          }}>
            {/* Power/Close button */}
            <button
              onClick={onClose}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #333, #222)',
                border: '2px solid #444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #e94560, #c73e54)';
                e.currentTarget.style.boxShadow = '0 0 15px #e94560';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #333, #222)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
            >
              <span style={{ color: '#fff', fontSize: '20px' }}>⏻</span>
            </button>

            {/* Brand */}
            <div style={{
              color: '#666',
              fontSize: '14px',
              fontFamily: 'monospace',
              letterSpacing: '4px'
            }}>
              VOXEL TV
            </div>

            {/* LED indicator */}
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#00ff00',
              boxShadow: '0 0 10px #00ff00',
              animation: 'pulse 2s infinite'
            }} />
          </div>
        </div>

        {/* TV Stand */}
        <div style={{
          width: '40%',
          height: '20px',
          background: 'linear-gradient(180deg, #3a3a4a, #2a2a3a)',
          margin: '0 auto',
          borderRadius: '0 0 10px 10px'
        }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default TVPopup;
