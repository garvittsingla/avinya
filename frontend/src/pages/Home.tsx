import { NavLink } from 'react-router-dom'
import VideoBackground from '../components/VideoBackground'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <VideoBackground videoSrc="/video.mp4" />
      <div className="container">
        <header className="main-header">
          <h1 className="game-title">VOXEL</h1>
          <p className="game-subtitle">🎮 EPIC PIXEL ADVENTURE 🎮</p>
          <div className="title-effects">
            <span className="particle"></span>
            <span className="particle"></span>
            <span className="particle"></span>
          </div>
        </header>

        <nav className="main-menu">

          <NavLink to="/gamepage" className="menu-btn neon-cyan">
            <span className="btn-icon">🚀</span>
            <span className="btn-text">START GAME</span>
          </NavLink>

          <NavLink to="/login" className="menu-btn neon-green">
            <span className="btn-icon">🔐</span>
            <span className="btn-text">LOGIN</span>
          </NavLink>

          <NavLink to="/how-to-play" className="menu-btn neon-pink">
            <span className="btn-icon">📖</span>
            <span className="btn-text">HOW TO PLAY</span>
          </NavLink>

          <NavLink to="/leaderboard" className="menu-btn neon-yellow">
            <span className="btn-icon">🏆</span>
            <span className="btn-text">LEADERBOARD</span>
          </NavLink>

          <NavLink to="/developers" className="menu-btn neon-green">
            <span className="btn-icon">👨‍💻</span>
            <span className="btn-text">DEVELOPERS</span>
          </NavLink>

          <NavLink to="/settings" className="menu-btn neon-red">
            <span className="btn-icon">⚙️</span>
            <span className="btn-text">SETTINGS</span>
          </NavLink>
        </nav>

        <footer className="main-footer">
          <p>© 2025 VOXEL STUDIOS | VERSION 2.1.0</p>
          <div className="social-links">
            <span className="social-icon">🎮</span>
            <span className="social-icon">🎯</span>
            <span className="social-icon">⭐</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

