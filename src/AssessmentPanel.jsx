import { useState } from 'react'
import './AssessmentPanel.css'

const AssessmentPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Johanna's VIA top 9 strengths
  const viaStrengths = [
    { rank: 1, name: 'Spirituality', category: 'TRANSCENDENCE' },
    { rank: 2, name: 'Appreciation of Beauty & Excellence', category: 'TRANSCENDENCE' },
    { rank: 3, name: 'Kindness', category: 'HUMANITY' },
    { rank: 4, name: 'Love of Learning', category: 'WISDOM' },
    { rank: 5, name: 'Fairness', category: 'JUSTICE' },
    { rank: 6, name: 'Judgment', category: 'WISDOM' },
    { rank: 7, name: 'Teamwork', category: 'JUSTICE' },
    { rank: 8, name: 'Honesty', category: 'COURAGE' },
    { rank: 9, name: 'Creativity', category: 'WISDOM' },
  ]

  // Johanna's SCARF scores (0-7 scale)
  const scarfScores = [
    { domain: 'Status', score: 5.67 },
    { domain: 'Certainty', score: 6.33 },
    { domain: 'Autonomy', score: 5.67 },
    { domain: 'Relatedness', score: 6.33 },
    { domain: 'Fairness', score: 6.0 },
  ]

  const getCategoryColor = (category) => {
    const colors = {
      WISDOM: '#1e40af', // darker blue
      COURAGE: '#1f2937', // dark gray-blue
      TRANSCENDENCE: '#0891b2', // cyan-blue
      JUSTICE: '#0369a1', // sky blue
      HUMANITY: '#059669', // emerald (variation of teal)
      TEMPERANCE: '#6b7280', // gray
    }
    return colors[category] || '#2563eb'
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 500)
  }

  return (
    <>
      {/* Washi Tape Trigger - Top Center - Hidden when overlay is open */}
      <div className={`washi-tape-trigger ${isOpen ? 'hidden' : ''}`} onClick={() => setIsOpen(true)}>
        <div className="washi-tape">
          <div className="washi-pattern"></div>
        </div>
        <div className="washi-tooltip">Oh you wanna know more?</div>
      </div>

      {/* Full-screen Assessment Modal */}
      {isOpen && (
        <div className={`assessment-overlay ${isClosing ? 'closing' : 'assessment-open'}`}>
          <button className="assessment-close" onClick={handleClose}>×</button>

          <div className="assessment-content">
            {/* VIA Section */}
            <section className="assessment-section via-section">
              <h2>VIA Character Strengths</h2>
              <p className="assessment-subtitle">My Top 9 Strengths</p>
              
              <div className="via-grid">
                {viaStrengths.map((strength) => (
                  <div key={strength.rank} className="via-card">
                    <div className="via-rank">{strength.rank}</div>
                    <div className="via-name">{strength.name}</div>
                    <div
                      className="via-category-badge"
                      style={{ backgroundColor: getCategoryColor(strength.category) }}
                    >
                      {strength.category}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SCARF Section */}
            <section className="assessment-section scarf-section">
              <h2>SCARF Assessment</h2>
              <p className="assessment-subtitle">My Motivational Drivers (0-7 scale)</p>
              
              <div className="scarf-chart">
                {scarfScores.map((item) => (
                  <div key={item.domain} className="scarf-bar-item">
                    <label className="scarf-label">{item.domain}</label>
                    <div className="scarf-bar-container">
                      <div
                        className="scarf-bar-fill"
                        style={{ width: `${(item.score / 7) * 100}%` }}
                      ></div>
                    </div>
                    <span className="scarf-score">{item.score}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  )
}

export default AssessmentPanel