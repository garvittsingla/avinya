import { useState } from 'react'
import VideoBackground from '../components/VideoBackground'
import BackButton from '../components/BackButton'
import './Leaderboard.css'

interface Player {
  rank: number;
  name: string;
  score: number;
}

const topPlayers: Player[] = [
  { rank: 1, name: 'VOXEL_KING', score: 15670 },
  { rank: 2, name: 'PIXEL_MASTER', score: 12845 },
  { rank: 3, name: 'CUBE_CRUSHER', score: 11290 }
]

const otherPlayers: Player[] = [
  { rank: 4, name: 'BLOCK_BUILDER', score: 9840 },
  { rank: 5, name: 'PIXEL_WARRIOR', score: 8755 },
  { rank: 6, name: 'CRAFT_LEGEND', score: 7920 },
  { rank: 7, name: 'MINE_HERO', score: 7340 },
  { rank: 8, name: 'VOXEL_NOOB', score: 6850 }
]

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('weekly')

  return (
    <div className="leaderboard-page">
      <VideoBackground videoSrc="/video.mp4" />
      <div className="container">
        <BackButton />
        
        <header>
          <h1 className="page-title">LEADERBOARD</h1>
          <p className="page-subtitle">TOP VOXEL WARRIORS</p>
        </header>
        
        <div className="leaderboard-container">
          <div className="leaderboard-tabs">
            <button 
              className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
              onClick={() => setActiveTab('weekly')}
            >
              WEEKLY
            </button>
            <button 
              className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => setActiveTab('monthly')}
            >
              MONTHLY
            </button>
            <button 
              className={`tab ${activeTab === 'alltime' ? 'active' : ''}`}
              onClick={() => setActiveTab('alltime')}
            >
              ALL TIME
            </button>
          </div>
          
          <div className="leaderboard-content">
            <div className="podium">
              <div className="podium-place second">
                <div className="place-number">2</div>
                <div className="player-name">{topPlayers[1].name}</div>
                <div className="player-score">{topPlayers[1].score.toLocaleString()}</div>
              </div>
              <div className="podium-place first">
                <div className="place-number">1</div>
                <div className="player-name">{topPlayers[0].name}</div>
                <div className="player-score">{topPlayers[0].score.toLocaleString()}</div>
                <div className="crown">👑</div>
              </div>
              <div className="podium-place third">
                <div className="place-number">3</div>
                <div className="player-name">{topPlayers[2].name}</div>
                <div className="player-score">{topPlayers[2].score.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="rankings-list">
              {otherPlayers.map((player) => (
                <div key={player.rank} className="ranking-item">
                  <span className="rank">{String(player.rank).padStart(2, '0')}</span>
                  <span className="name">{player.name}</span>
                  <span className="score">{player.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="your-rank">
            <div className="rank-card">
              <span className="your-position">YOUR RANK: #42</span>
              <span className="your-score">SCORE: 3,240</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
