import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import GamePage from './pages/GamePage'
import Home from './pages/Home'
import Login from './pages/Login'
import HowToPlay from './pages/HowToPlay'
import Leaderboard from './pages/Leaderboard'
import Developers from './pages/Developers'
import Settings from './pages/Settings'


function HomePage() {
  const [username, setUsername] = useState('')
  const [roomslug, setRoomslug] = useState('')
  const navigate = useNavigate()

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim() && roomslug.trim()) {
      navigate(`/game/${roomslug}`, { state: { username } })
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#111827'
    }}>
      <h1 style={{ color: 'white', fontSize: '36px', marginBottom: '32px' }}>
        Multiplayer Phaser Game
      </h1>
      <form onSubmit={handleJoin} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#1f2937',
        padding: '32px',
        borderRadius: '16px',
        width: '320px'
      }}>
        <div>
          <label style={{ color: '#9ca3af', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '16px'
            }}
          />
        </div>
        <div>
          <label style={{ color: '#9ca3af', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Room Code
          </label>
          <input
            type="text"
            value={roomslug}
            onChange={(e) => setRoomslug(e.target.value)}
            placeholder="Enter room code"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '16px'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '14px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          Join Game
        </button>
      </form>
      <p style={{ color: '#6b7280', marginTop: '24px', fontSize: '14px' }}>
        Use arrow keys to move your character
      </p>
    </div>
  )
}

function GameWrapper() {
  const navigate = useNavigate()
  // Get roomslug from URL params
  const roomslug = window.location.pathname.split('/game/')[1] || 'default-room'
  // Get username from localStorage or state
  const storedState = window.history.state?.usr
  const username = storedState?.username || `Player_${Math.floor(Math.random() * 1000)}`

  const handleLeave = () => {
    navigate('/')
  }

  return (
    <GamePage
      username={username}
      roomslug={roomslug}
      onLeave={handleLeave}
    />
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gamepage" element={<HomePage />} />
        <Route path="/game/:roomslug" element={<GameWrapper />} />
        <Route path="/login" element={<Login />} />
        <Route path="/howtoplay" element={<HowToPlay />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
}

export default App
