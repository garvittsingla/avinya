import VideoBackground from '../components/VideoBackground'
import BackButton from '../components/BackButton'
import './Developers.css'

interface Developer {
  name: string;
  role: string;
  skills: string[];
  quote: string;
  image: string;
}

const developers: Developer[] = [
  {
    name: 'Garvit Singla',
    role: 'LEAD DEVELOPER',
    skills: ['C++', 'UNITY', '3D'],
    quote: '"PIXELS ARE LIFE"',
    image: '/singla.png'
  },
  {
    name: 'Fanibhushan',
    role: 'GAME DESIGNER',
    skills: ['UI/UX', 'ART', 'DESIGN'],
    quote: '"BEAUTY IN SIMPLICITY"',
    image: '/image.png'
  },
  {
    name: 'Kartik Manchanda',
    role: 'SOUND ENGINEER',
    skills: ['AUDIO', 'FX', 'MUSIC'],
    quote: '"8-BIT BEATS RULE"',
    image: '/manchanda.png'
  },
  {
    name: 'Garvit Khatkar',
    role: 'QA TESTER',
    skills: ['TESTING', 'DEBUG', 'QA'],
    quote: '"NO BUG SURVIVES"',
    image: '/khatkar1.png'
  }
]

const stats = [
  { number: '2', label: 'YEARS DEVELOPMENT' },
  { number: '50K+', label: 'LINES OF CODE' },
  { number: '100+', label: 'COFFEE CUPS' },
  { number: '∞', label: 'PASSION' }
]

export default function Developers() {
  return (
    <div className="developers-page">
      <VideoBackground videoSrc="/video.mp4" />
      <div className="container">
        <BackButton />
        
        <header>
          <h1 className="page-title">DEVELOPERS</h1>
          <p className="page-subtitle">MEET THE PIXEL CREATORS</p>
        </header>
        
        <div className="developers-grid">
          {developers.map((dev) => (
            <div key={dev.name} className="developer-card">
              <div className="dev-photo-placeholder">
                <img src={dev.image} alt={dev.name} />
                <div className="pixel-border"></div>
              </div>
              <div className="dev-info">
                <h3 className="dev-name">{dev.name}</h3>
                <p className="dev-role">{dev.role}</p>
                <div className="dev-skills">
                  {dev.skills.map(skill => (
                    <span key={skill} className="skill">{skill}</span>
                  ))}
                </div>
                <p className="dev-quote">{dev.quote}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="team-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
