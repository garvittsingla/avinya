import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VideoBackground from '../components/VideoBackground'
import BackButton from '../components/BackButton'
import usersData from '../data/users.json'
import './Login.css'

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notification, setNotification] = useState<Notification | null>(null)
  const [shake, setShake] = useState(false)
  const navigate = useNavigate()

  const showNotification = (message: string, type: Notification['type']) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      showNotification('Please enter both username and password!', 'error')
      return
    }

    const user = usersData.users.find((u: User) =>
      (u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === username.toLowerCase()) &&
      u.password === password
    )

    if (user) {
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
        })
      )

      showNotification('Login Successful! Redirecting...', 'success')

      setTimeout(() => {
        navigate('/gamepage');
      }, 1500)
    } else {
      showNotification('Invalid username or password!', 'error')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleGuestLogin = () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: 0,
        username: 'GUEST_PLAYER',
        email: 'guest@voxelstudios.com',
      })
    )

    showNotification('Playing as Guest! Redirecting...', 'success')
    setTimeout(() => navigate('/'), 1500)
  }

  const handleCreateAccount = () => {
    showNotification('Account creation feature coming soon!', 'info')
  }

  return (
    <div className="login-page">
      <VideoBackground videoSrc="/video.mp4" />
      <div className="container">
        <BackButton />

        <div className="login-container">
          <h1 className="page-title">PLAYER LOGIN</h1>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="username">USERNAME</label>
              <input
                type="text"
                id="username"
                placeholder="ENTER USERNAME"
                maxLength={16}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={shake ? 'shake' : ''}
                onKeyPress={(e) => e.key === 'Enter' && document.getElementById('password')?.focus()}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">PASSWORD</label>
              <input
                type="password"
                id="password"
                placeholder="ENTER PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={shake ? 'shake' : ''}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="action-btn primary">ENTER GAME</button>
              <button type="button" className="action-btn secondary" onClick={handleCreateAccount}>
                CREATE ACCOUNT
              </button>
              <button type="button" className="guest-btn" onClick={handleGuestLogin}>
                PLAY AS GUEST
              </button>
            </div>
          </form>

          <div className="server-info">
            <div className="info-item">
              <span className="info-label">SERVER STATUS:</span>
              <span className="info-value online">ONLINE</span>
            </div>
            <div className="info-item">
              <span className="info-label">PLAYERS:</span>
              <span className="info-value">1,337</span>
            </div>
            <div className="info-item">
              <span className="info-label">PING:</span>
              <span className="info-value">42ms</span>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type} show`}>
          {notification.message}
        </div>
      )}
    </div>
  )
}
