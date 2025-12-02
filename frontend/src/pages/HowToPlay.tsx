import VideoBackground from '../components/VideoBackground'
import BackButton from '../components/BackButton'
import './HowToPlay.css'

const controls = [
  { key: 'W A S D', action: 'MOVE' },
  { key: 'MOUSE', action: 'LOOK AROUND' },
  { key: 'SPACE', action: 'JUMP' },
  { key: 'SHIFT', action: 'RUN' },
  { key: 'E', action: 'INTERACT' }
]

const objectives = [
  'EXPLORE VOXEL WORLDS',
  'COLLECT RESOURCES',
  'BUILD STRUCTURES',
  'SURVIVE THE NIGHT',
  'COMPLETE QUESTS'
]

const crafting = [
  { key: 'I', text: 'OPEN INVENTORY' },
  { key: 'DRAG', text: 'COMBINE ITEMS' },
  { key: 'CLICK', text: 'CREATE TOOLS' }
]

const tips = [
  'START WITH WOOD COLLECTION',
  'BUILD SHELTER BEFORE NIGHT',
  'LIGHT UP DARK AREAS',
  'SAVE PROGRESS OFTEN'
]

export default function HowToPlay() {
  return (
    <div className="howtoplay-page">
      <VideoBackground videoSrc="/video.mp4" />
      <div className="container">
        <BackButton />
        
        <header>
          <h1 className="page-title">HOW TO PLAY</h1>
          <p className="page-subtitle">MASTER THE VOXEL WORLD</p>
        </header>
        
        <div className="content-grid">
          <div className="instruction-card controls">
            <div className="card-header">
              <span className="card-icon">🎮</span>
              <h2>CONTROLS</h2>
            </div>
            <div className="card-content">
              {controls.map((control) => (
                <div key={control.key} className="control-item">
                  <span className="key">{control.key}</span>
                  <span className="action">{control.action}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="instruction-card objectives">
            <div className="card-header">
              <span className="card-icon">🎯</span>
              <h2>OBJECTIVES</h2>
            </div>
            <div className="card-content">
              {objectives.map((obj, index) => (
                <div key={index} className="objective-item">
                  <span className="bullet">{String(index + 1).padStart(2, '0')}</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="instruction-card crafting">
            <div className="card-header">
              <span className="card-icon">⚒️</span>
              <h2>CRAFTING</h2>
            </div>
            <div className="card-content">
              {crafting.map((step) => (
                <div key={step.key} className="craft-step">
                  <span className="step-key">{step.key}</span>
                  <span className="step-text">{step.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="instruction-card tips">
            <div className="card-header">
              <span className="card-icon">💡</span>
              <h2>PRO TIPS</h2>
            </div>
            <div className="card-content">
              {tips.map((tip, index) => (
                <div key={index} className="tip-item">
                  <span className="tip-icon">→</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
