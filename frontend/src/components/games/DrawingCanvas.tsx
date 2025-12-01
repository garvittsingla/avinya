import { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  username: string;
  roomslug: string;
  sendGameState: (gameType: string, gameData: any) => void;
  gameState: { gameType: string; gameData: any; player: string } | null;
  onBack: () => void;
}

interface DrawAction {
  type: 'draw' | 'clear';
  x?: number;
  y?: number;
  prevX?: number;
  prevY?: number;
  color?: string;
  size?: number;
}

const COLORS = [
  '#2D1B00', '#8B4513', '#D2691E', '#CD853F', '#F4A460',
  '#FF6347', '#FF4500', '#FFD700', '#FFA500', '#FFFFFF'
];

const SIZES = [2, 5, 10, 20];

function DrawingCanvas({ username, roomslug, sendGameState, gameState, onBack }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2D1B00');
  const [brushSize, setBrushSize] = useState(5);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas background to cream/beige like the stage
    ctx.fillStyle = '#F5E6D3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Handle incoming draw actions from other players
  useEffect(() => {
    if (gameState && gameState.gameType === 'drawing' && gameState.player !== username) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const data = gameState.gameData as DrawAction;

      if (data.type === 'clear') {
        ctx.fillStyle = '#F5E6D3';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (data.type === 'draw' && data.x !== undefined && data.y !== undefined) {
        ctx.strokeStyle = data.color || '#2D1B00';
        ctx.lineWidth = data.size || 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        if (data.prevX !== undefined && data.prevY !== undefined) {
          ctx.moveTo(data.prevX, data.prevY);
        } else {
          ctx.moveTo(data.x, data.y);
        }
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      }
    }
  }, [gameState, username]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getCanvasCoordinates(e);
    setLastPos(pos);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasCoordinates(e);

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPos) {
      ctx.moveTo(lastPos.x, lastPos.y);
    } else {
      ctx.moveTo(pos.x, pos.y);
    }
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Send draw action to other players
    sendGameState('drawing', {
      type: 'draw',
      x: pos.x,
      y: pos.y,
      prevX: lastPos?.x,
      prevY: lastPos?.y,
      color,
      size: brushSize
    });

    setLastPos(pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F5E6D3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Send clear action to other players
    sendGameState('drawing', { type: 'clear' });
  };

  // Suppress unused variable warning
  void roomslug;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '10px',
      background: 'linear-gradient(180deg, #D2A679 0%, #C89968 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '800px',
      }}>
        <button
          onClick={onBack}
          style={{
            background: '#8B4513',
            border: '3px solid #5D2E0F',
            borderRadius: '4px',
            padding: '10px 20px',
            color: '#FFF5E1',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 'bold',
            boxShadow: '0 4px 0 #5D2E0F',
            transition: 'all 0.1s'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = '0 2px 0 #5D2E0F';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 0 #5D2E0F';
          }}
        >
          ← Back
        </button>
        <h2 style={{
          fontSize: '28px',
          color: '#5D2E0F',
          fontWeight: 'bold',
          textShadow: '2px 2px 0 #FFF5E1',
          margin: 0
        }}>
          🎨 Drawing Stage
        </h2>
        <div style={{ width: '100px' }} />
      </div>

      {/* Main container with decorative border */}
      <div style={{
        background: '#8B4513',
        padding: '8px',
        borderRadius: '8px',
        border: '4px solid #5D2E0F',
        boxShadow: '0 8px 0 #5D2E0F, inset 0 4px 8px rgba(0,0,0,0.2)'
      }}>
        {/* Inner container */}
        <div style={{
          background: 'linear-gradient(180deg, #E8C7A0 0%, #D9B88F 100%)',
          padding: '20px',
          borderRadius: '4px',
          border: '3px solid #A0693F'
        }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#C89968',
            borderRadius: '6px',
            border: '3px solid #A0693F',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {/* Colors */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ 
                color: '#5D2E0F', 
                fontSize: '14px', 
                fontWeight: 'bold',
                marginRight: '6px' 
              }}>
                Color:
              </span>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: c,
                    border: color === c ? '4px solid #5D2E0F' : '3px solid #8B6F47',
                    cursor: 'pointer',
                    boxShadow: color === c 
                      ? '0 4px 0 #5D2E0F, inset 0 2px 4px rgba(0,0,0,0.2)' 
                      : '0 3px 0 #8B6F47',
                    transition: 'all 0.1s'
                  }}
                  onMouseDown={(e) => {
                    if (color !== c) {
                      e.currentTarget.style.transform = 'translateY(2px)';
                      e.currentTarget.style.boxShadow = '0 1px 0 #8B6F47';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (color !== c) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 0 #8B6F47';
                    }
                  }}
                />
              ))}
            </div>

            {/* Divider */}
            <div style={{ width: '2px', height: '40px', background: '#8B6F47' }} />

            {/* Brush sizes */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ 
                color: '#5D2E0F', 
                fontSize: '14px', 
                fontWeight: 'bold',
                marginRight: '6px' 
              }}>
                Size:
              </span>
              {SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setBrushSize(s)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '4px',
                    background: brushSize === s ? '#D9B88F' : '#E8C7A0',
                    border: brushSize === s ? '4px solid #5D2E0F' : '3px solid #A0693F',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: brushSize === s 
                      ? '0 4px 0 #5D2E0F, inset 0 2px 4px rgba(0,0,0,0.1)' 
                      : '0 3px 0 #A0693F',
                    transition: 'all 0.1s'
                  }}
                  onMouseDown={(e) => {
                    if (brushSize !== s) {
                      e.currentTarget.style.transform = 'translateY(2px)';
                      e.currentTarget.style.boxShadow = '0 1px 0 #A0693F';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (brushSize !== s) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 0 #A0693F';
                    }
                  }}
                >
                  <div style={{
                    width: `${Math.min(s + 4, 24)}px`,
                    height: `${Math.min(s + 4, 24)}px`,
                    borderRadius: '50%',
                    background: color,
                    border: '1px solid rgba(0,0,0,0.2)'
                  }} />
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ width: '2px', height: '40px', background: '#8B6F47' }} />

            {/* Clear button */}
            <button
              onClick={clearCanvas}
              style={{
                background: '#CD5C5C',
                border: '3px solid #8B3A3A',
                borderRadius: '4px',
                padding: '10px 20px',
                color: '#FFF5E1',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                boxShadow: '0 4px 0 #8B3A3A',
                transition: 'all 0.1s'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = '0 2px 0 #8B3A3A';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 0 #8B3A3A';
              }}
            >
              🗑️ Clear Canvas
            </button>
          </div>

          {/* Canvas with decorative frame */}
          <div style={{
            background: '#8B4513',
            padding: '12px',
            borderRadius: '6px',
            border: '4px solid #5D2E0F',
            boxShadow: '0 6px 0 #5D2E0F, inset 0 4px 8px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              background: '#D2691E',
              padding: '6px',
              borderRadius: '2px'
            }}>
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  borderRadius: '2px',
                  cursor: 'crosshair',
                  display: 'block',
                  border: '2px solid #A0522D'
                }}
              />
            </div>
          </div>

          {/* Info text */}
          <p style={{ 
            color: '#5D2E0F', 
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '16px',
            marginBottom: '0',
            fontWeight: '500'
          }}>
            🎭 Draw together with everyone on stage! All drawings are shared in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DrawingCanvas;