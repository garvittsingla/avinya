import { useState } from 'react'
import VideoBackground from '../components/VideoBackground'
import BackButton from '../components/BackButton'
import './Settings.css'

export default function Settings() {
  const [masterVolume, setMasterVolume] = useState(75)
  const [musicVolume, setMusicVolume] = useState(60)
  const [sfxVolume, setSfxVolume] = useState(80)
  const [sensitivity, setSensitivity] = useState(5)
  const [fullscreen, setFullscreen] = useState(true)
  const [invertY, setInvertY] = useState(false)
  const [quality, setQuality] = useState('LOW')
  const [resolution, setResolution] = useState('1920x1080')

  const handleSave = () => {
    console.log('Settings saved:', {
      masterVolume,
      musicVolume,
      sfxVolume,
      sensitivity,
      fullscreen,
      invertY,
      quality,
      resolution
    })
    alert('Settings saved successfully!')
  }

  const handleReset = () => {
    setMasterVolume(75)
    setMusicVolume(60)
    setSfxVolume(80)
    setSensitivity(5)
    setFullscreen(true)
    setInvertY(false)
    setQuality('LOW')
    setResolution('1920x1080')
    alert('Settings reset to default!')
  }

  return (
    <div className="settings-page">
      <VideoBackground videoSrc="/video.mp4" />
      <div className="container">
        <BackButton />
        
        <header>
          <h1 className="page-title">SETTINGS</h1>
          <p className="page-subtitle">CONFIGURE YOUR EXPERIENCE</p>
        </header>
        
        <div className="settings-container">
          <div className="settings-section">
            <h2 className="section-title">GRAPHICS</h2>
            <div className="setting-item">
              <label>RESOLUTION</label>
              <select 
                className="setting-select" 
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              >
                <option>1920x1080</option>
                <option>1366x768</option>
                <option>1280x720</option>
                <option>1024x768</option>
              </select>
            </div>
            <div className="setting-item">
              <label>QUALITY</label>
              <div className="quality-options">
                {['LOW', 'MEDIUM', 'HIGH', 'ULTRA'].map((q) => (
                  <button
                    key={q}
                    className={`quality-btn ${quality === q ? 'active' : ''}`}
                    onClick={() => setQuality(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-item">
              <label>FULLSCREEN</label>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="fullscreen" 
                  checked={fullscreen}
                  onChange={(e) => setFullscreen(e.target.checked)}
                />
                <span className="slider"></span>
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h2 className="section-title">AUDIO</h2>
            <div className="setting-item">
              <label>MASTER VOLUME</label>
              <div className="volume-control">
                <input 
                  type="range" 
                  className="volume-slider" 
                  min="0" 
                  max="100" 
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                />
                <span className="volume-value">{masterVolume}%</span>
              </div>
            </div>
            <div className="setting-item">
              <label>MUSIC VOLUME</label>
              <div className="volume-control">
                <input 
                  type="range" 
                  className="volume-slider" 
                  min="0" 
                  max="100" 
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                />
                <span className="volume-value">{musicVolume}%</span>
              </div>
            </div>
            <div className="setting-item">
              <label>SFX VOLUME</label>
              <div className="volume-control">
                <input 
                  type="range" 
                  className="volume-slider" 
                  min="0" 
                  max="100" 
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(Number(e.target.value))}
                />
                <span className="volume-value">{sfxVolume}%</span>
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h2 className="section-title">CONTROLS</h2>
            <div className="setting-item">
              <label>MOUSE SENSITIVITY</label>
              <div className="sensitivity-control">
                <input 
                  type="range" 
                  className="sens-slider" 
                  min="1" 
                  max="10" 
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                />
                <span className="sens-value">{sensitivity}</span>
              </div>
            </div>
            <div className="setting-item">
              <label>INVERT Y-AXIS</label>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="invert-y"
                  checked={invertY}
                  onChange={(e) => setInvertY(e.target.checked)}
                />
                <span className="slider"></span>
              </div>
            </div>
          </div>
          
          <div className="settings-actions">
            <button className="action-btn save" onClick={handleSave}>SAVE SETTINGS</button>
            <button className="action-btn reset" onClick={handleReset}>RESET TO DEFAULT</button>
          </div>
        </div>
      </div>
    </div>
  )
}
