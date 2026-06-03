import { Fragment, useState, useEffect, useRef } from 'react'
import './App.css'
import AssessmentPanel from './AssessmentPanel'

// Star emojis
const StarInsight = () => <span className="star-emoji">✨</span>
const StarGoal = () => <span className="star-emoji">⭐</span>
const StarAction = () => <span className="star-emoji">💫</span>

// Fixed 6-week timeline: Jun 1 (Module 2) → Jul 11 (Module 6)
const FIXED_WEEKS = [
  { 
    index: 0,
    start: new Date(2026, 5, 1), 
    end: new Date(2026, 5, 7),
    label: 'Week 1',
    unlockDate: 'Jun 1, 2026'
  },
  { 
    index: 1,
    start: new Date(2026, 5, 8), 
    end: new Date(2026, 5, 14),
    label: 'Week 2',
    unlockDate: 'Jun 8, 2026'
  },
  { 
    index: 2,
    start: new Date(2026, 5, 15), 
    end: new Date(2026, 5, 21),
    label: 'Week 3',
    unlockDate: 'Jun 15, 2026'
  },
  { 
    index: 3,
    start: new Date(2026, 5, 22), 
    end: new Date(2026, 5, 28),
    label: 'Week 4',
    unlockDate: 'Jun 22, 2026'
  },
  { 
    index: 4,
    start: new Date(2026, 5, 29), 
    end: new Date(2026, 6, 5),
    label: 'Week 5',
    unlockDate: 'Jun 29, 2026'
  },
  { 
    index: 5,
    start: new Date(2026, 6, 6), 
    end: new Date(2026, 6, 11),
    label: 'Week 6',
    unlockDate: 'Jul 6, 2026'
  },
]

const getWeekIndexForDate = (timestamp) => {
  const d = new Date(timestamp)
  for (let i = 0; i < FIXED_WEEKS.length; i++) {
    const weekStart = FIXED_WEEKS[i].start.getTime()
    const nextWeekStart = i < FIXED_WEEKS.length - 1 ? FIXED_WEEKS[i + 1].start.getTime() : Infinity
    if (d.getTime() >= weekStart && d.getTime() < nextWeekStart) return i
  }
  return FIXED_WEEKS.length - 1
}

function App() {
  const [entries, setEntries] = useState([])
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [formData, setFormData] = useState({ insight: '', goal: '', action: '' })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [positions, setPositions] = useState({})
  const scrollContainerRef = useRef(null)
  const captionInputRef = useRef(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('leadershipDiary')
    if (saved) setEntries(JSON.parse(saved))
  }, [])

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('leadershipDiary', JSON.stringify(entries))
  }, [entries])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Focus caption input when photo is pending
  useEffect(() => {
    if (pendingPhoto && captionInputRef.current) {
      captionInputRef.current.focus()
    }
  }, [pendingPhoto])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  // Mouse drag handlers
  const handleMouseDown = (e, entryId) => {
    if (['BUTTON', 'INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
    setDraggingId(entryId)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseMove = (e) => {
    if (draggingId === null) return
    const scatterContainer = document.querySelector('.week-scatter')
    if (!scatterContainer) return
    const containerRect = scatterContainer.getBoundingClientRect()
    const newLeft = e.clientX - containerRect.left - dragOffset.x
    const newTop = e.clientY - containerRect.top - dragOffset.y
    setPositions(prev => ({
      ...prev,
      [draggingId]: {
        left: Math.max(0, Math.min(newLeft, containerRect.width - 280)),
        top: Math.max(0, newTop),
      },
    }))
  }

  const handleMouseUp = () => setDraggingId(null)

  useEffect(() => {
    if (draggingId !== null) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggingId, dragOffset])

  // Upload photo to R2
  const handlePhotoUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      
      if (res.ok) {
        const { url } = await res.json()
        setPendingPhoto(url)
        setPhotoCaption('')
      } else {
        alert('Failed to upload photo')
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Error uploading photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Save photo entry after caption
  const savePendingPhoto = () => {
    if (!pendingPhoto) return
    
    const newEntry = {
      id: Date.now(),
      type: 'photo',
      weekIndex: getWeekIndexForDate(Date.now()),
      image: pendingPhoto,
      caption: photoCaption,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      }),
      timestamp: Date.now(),
    }
    
    setEntries([newEntry, ...entries])
    setPendingPhoto(null)
    setPhotoCaption('')
  }

  // Add text entry
  const handleAddEntry = () => {
    if (!formData.insight.trim() && !formData.goal.trim() && !formData.action.trim()) {
      alert('Please add at least one field')
      return
    }

    const newEntry = {
      id: Date.now(),
      type: 'text',
      weekIndex: getWeekIndexForDate(Date.now()),
      insight: formData.insight,
      goal: formData.goal,
      action: formData.action,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      }),
      timestamp: Date.now(),
    }

    setEntries([newEntry, ...entries])
    setFormData({ insight: '', goal: '', action: '' })
    setShowNewEntry(false)
  }

  // Check if a week is in the past, current, or future
  const getWeekStatus = (weekIndex) => {
    const now = new Date()
    const weekStart = FIXED_WEEKS[weekIndex].start
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    if (now < weekStart) return 'future'
    if (now >= weekEnd) return 'past'
    return 'current'
  }

  const photoRotations = [-8, 5, 3, -5, 7]
  const photoLefts = ['10%', '65%', '15%', '70%', '38%']
  const cardRotations = [-3, 2, 1, -2]
  const cardLefts = ['12%', '58%', '28%', '68%']

  const currentTime_display = currentTime.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
  }) + ' ' + currentTime.toLocaleTimeString('en-US')

  return (
    <div className={`app${darkMode ? ' dark' : ''}`}>
      {/* Assessment Panel */}
      <AssessmentPanel />

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>Leadership Diary</h1>
          <p className="tagline">{entries.length} entries</p>
        </div>
        <div className="header-timestamp">{currentTime_display}</div>
        <button className="dark-toggle" onClick={() => setDarkMode(d => !d)} aria-label="Toggle dark mode">
          {darkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </header>

      {/* Main Canvas - Horizontal Scrolling Weeks */}
      <div className="canvas">
        <div className="weeks-scroll-container" ref={scrollContainerRef}>
          {FIXED_WEEKS.map((week) => {
            const weekEntries = entries.filter(e => e.weekIndex === week.index)
            const status = getWeekStatus(week.index)
            const isLocked = status === 'future'

            return (
              <div 
                key={week.index} 
                className={`week-container week-${status}`}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Week Label - Top Left */}
                <div className="week-label">
                  <h2>{week.label}</h2>
                </div>

                {/* Unlock Notice - Future Weeks */}
                {isLocked && (
                  <div className="week-overlay">
                    <div className="unlock-message">
                      <p>{week.label} (Will unlock on {week.unlockDate})</p>
                    </div>
                  </div>
                )}

                {/* Scattered Entries Container */}
                <div className="week-scatter">
                  {weekEntries.map((entry, i) => {
                    const customPos = positions[entry.id]

                    if (entry.type === 'photo') {
                      return (
                        <div
                          key={entry.id}
                          className="polaroid floating"
                          style={{
                            left: customPos ? `${customPos.left}px` : photoLefts[i % 5],
                            top: customPos ? `${customPos.top}px` : `${80 + (i % 3) * 200}px`,
                            transform: `rotate(${photoRotations[i % 5]}deg)`,
                            cursor: draggingId === entry.id ? 'grabbing' : 'grab',
                          }}
                          onMouseDown={(e) => handleMouseDown(e, entry.id)}
                          onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                        >
                          <img src={entry.image} alt="memory" />
                          <div className="polaroid-content">
                            {entry.caption && <div className="polaroid-caption">{entry.caption}</div>}
                            <div className="polaroid-date">{entry.date}</div>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={entry.id}
                        className="entry-card scattered floating"
                        style={{
                          left: customPos ? `${customPos.left}px` : cardLefts[i % 4],
                          top: customPos ? `${customPos.top}px` : `${80 + Math.floor(i / 2) * 200}px`,
                          transform: `rotate(${cardRotations[i % 4]}deg)`,
                          cursor: draggingId === entry.id ? 'grabbing' : 'grab',
                        }}
                        onMouseDown={(e) => handleMouseDown(e, entry.id)}
                        onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                      >
                        <div className="washi-tape"></div>
                        <div className="card-inner">
                          <div className="card-date">{entry.date}</div>
                          <div className="card-preview">
                            {entry.insight && <p>💡 {entry.insight.substring(0, 40)}...</p>}
                          </div>
                        </div>
                        <div className="envelope-flap"></div>
                      </div>
                    )
                  })}
                </div>

                {/* Add Button & Camera Button - Current Week Only */}
                {status === 'current' && !isLocked && (
                  <>
                    <button className="camera-button" onClick={() => document.getElementById('camera-input').click()}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </button>
                    <button className="plus-button" onClick={() => setShowNewEntry(true)}>+</button>
                  </>
                )}
              </div>
            )
          })}

          {/* Final "You made it!" Section */}
          <div className="week-container celebration">
            <div className="celebration-content">
              <h2>Woah you made it here!</h2>
              <p>You've completed the 6-week leadership journey. 🎉</p>
            </div>
          </div>
        </div>

        <input
          type="file"
          id="camera-input"
          accept="image/*"
          onChange={(e) => e.target.files && handlePhotoUpload(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </div>

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="overlay" onClick={() => setShowNewEntry(false)}>
          <div className="modal new-entry-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Entry</h2>
              <button className="close-btn" onClick={() => setShowNewEntry(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label><StarInsight /> Key Insight</label>
                <textarea
                  value={formData.insight}
                  onChange={(e) => setFormData({ ...formData, insight: e.target.value })}
                  placeholder="What did you learn this week?"
                />
              </div>
              <div className="form-group">
                <label><StarGoal /> Goal</label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="What's your goal?"
                />
              </div>
              <div className="form-group">
                <label><StarAction /> Action</label>
                <textarea
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  placeholder="What will you do differently?"
                />
              </div>
              <button className="btn-primary" onClick={handleAddEntry}>Save Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Caption Modal */}
      {pendingPhoto && (
        <div className="overlay" onClick={() => setPendingPhoto(null)}>
          <div className="modal photo-caption-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Caption</h2>
              <button className="close-btn" onClick={() => setPendingPhoto(null)}>✕</button>
            </div>
            <div className="modal-body">
              <img src={pendingPhoto} alt="preview" className="caption-preview" />
              <input
                ref={captionInputRef}
                type="text"
                placeholder="Optional caption..."
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') savePendingPhoto() }}
              />
              <div className="modal-actions">
                <button className="btn-primary" onClick={savePendingPhoto}>Save Photo</button>
                <button className="btn-secondary" onClick={() => setPendingPhoto(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="overlay" onClick={() => setSelectedEntry(null)}>
          <div className="modal entry-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEntry.date}</h2>
              <button className="close-btn" onClick={() => setSelectedEntry(null)}>✕</button>
            </div>
            <div className="modal-body">
              {selectedEntry.type === 'photo' && selectedEntry.image && (
                <img src={selectedEntry.image} alt="entry" className="detail-image" />
              )}
              {selectedEntry.insight && (
                <div className="detail-field">
                  <h3><StarInsight /> Insight</h3>
                  <p>{selectedEntry.insight}</p>
                </div>
              )}
              {selectedEntry.goal && (
                <div className="detail-field">
                  <h3><StarGoal /> Goal</h3>
                  <p>{selectedEntry.goal}</p>
                </div>
              )}
              {selectedEntry.action && (
                <div className="detail-field">
                  <h3><StarAction /> Action</h3>
                  <p>{selectedEntry.action}</p>
                </div>
              )}
              {selectedEntry.caption && (
                <div className="detail-field">
                  <h3>Caption</h3>
                  <p>{selectedEntry.caption}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App