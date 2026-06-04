import { Fragment, useState, useEffect, useRef } from 'react'
import './App.css'
import AssessmentPanel from './AssessmentPanel'

// Star emojis
const StarInsight = () => <span className="star-emoji">✨</span>
const StarGoal = () => <span className="star-emoji">⭐</span>
const StarAction = () => <span className="star-emoji">💫</span>

// Fixed 6-module timeline from Leadership by Design course
const FIXED_WEEKS = [
  { 
    index: 0,
    start: new Date(2026, 5, 1), 
    end: new Date(2026, 5, 7),
    label: 'Module 1',
    title: 'Introduction',
    unlockDate: 'Jun 1, 2026'
  },
  { 
    index: 1,
    start: new Date(2026, 5, 8), 
    end: new Date(2026, 5, 14),
    label: 'Module 2',
    title: 'Self Leadership',
    unlockDate: 'Jun 8, 2026'
  },
  { 
    index: 2,
    start: new Date(2026, 5, 15), 
    end: new Date(2026, 5, 21),
    label: 'Module 3',
    title: 'Leading from the Whole',
    unlockDate: 'Jun 15, 2026'
  },
  { 
    index: 3,
    start: new Date(2026, 5, 22), 
    end: new Date(2026, 5, 28),
    label: 'Module 4',
    title: 'Leading from the Side',
    unlockDate: 'Jun 22, 2026'
  },
  { 
    index: 4,
    start: new Date(2026, 5, 29), 
    end: new Date(2026, 6, 5),
    label: 'Module 5',
    title: 'Leading from the Front',
    unlockDate: 'Jun 29, 2026'
  },
  { 
    index: 5,
    start: new Date(2026, 6, 6), 
    end: new Date(2026, 6, 11),
    label: 'Module 6',
    title: 'Wrapping Up',
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

const ENTRY_TYPES = {
  insight: { label: 'Insight', color: '#3b82f6' },
  learning: { label: 'Learning', color: '#14b8a6' },
  growth: { label: 'Growth', color: '#10b981' },
  'speaker-notes': { label: 'Speaker Notes', color: '#f59e0b' },
  events: { label: 'Events', color: '#a855f7' },
  thought: { label: 'Thought', color: '#ec4899' }
}

const getContentPlaceholder = (type) => {
  const placeholders = {
    insight: 'What realization or insight did you have?',
    learning: 'What surprised you? What\'s one key takeaway?',
    growth: 'Where are you stretching? What\'s challenging you?',
    'speaker-notes': 'Key quotes or ideas from the speaker...',
    events: 'What happened? What was significant about this?',
    thought: 'What\'s on your mind?'
  }
  return placeholders[type] || 'Write your reflection...'
}

// Auth credentials
const CREDENTIALS = {
  email: 'jhuarachi654@gmail.com',
  password: 'Brocky123!'
}

function App() {
  const [entries, setEntries] = useState([])
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [editingPhotoCaption, setEditingPhotoCaption] = useState('')
  const [formData, setFormData] = useState({ type: 'insight', title: '', content: '' })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('diarySignedIn') === 'true'
    }
    return false
  })
  const [showSignIn, setShowSignIn] = useState(false)
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInError, setSignInError] = useState('')
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

  // Handle sign-in
  const handleSignIn = () => {
    setSignInError('')
    const email = signInEmail.trim()
    const password = signInPassword.trim()
    
    if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
      localStorage.setItem('diarySignedIn', 'true')
      setIsSignedIn(true)
      setSignInEmail('')
      setSignInPassword('')
      setShowSignIn(false)
    } else {
      setSignInError('Invalid email or password')
    }
  }

  // Handle sign-out
  const handleSignOut = () => {
    localStorage.removeItem('diarySignedIn')
    setIsSignedIn(false)
    setSelectedEntry(null)
    setShowNewEntry(false)
    setEditingEntry(null)
  }

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
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please add a title and content')
      return
    }

    const newEntry = {
      id: Date.now(),
      entryType: formData.type,
      weekIndex: getWeekIndexForDate(Date.now()),
      title: formData.title,
      content: formData.content,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      }),
      timestamp: Date.now(),
    }

    if (editingEntry) {
      setEntries(entries.map(e => e.id === editingEntry.id ? newEntry : e))
      setEditingEntry(null)
    } else {
      setEntries([newEntry, ...entries])
    }
    
    setFormData({ type: 'insight', title: '', content: '' })
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isSignedIn ? (
            <button 
              onClick={() => setShowSignIn(true)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0px',
                cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: '700'
              }}
            >
              Sign In
            </button>
          ) : (
            <button 
              onClick={handleSignOut}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '0px',
                cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#9ca3af'
                e.target.style.color = '#374151'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.color = '#6b7280'
              }}
              className="sign-out-btn"
            >
              Sign Out
            </button>
          )}
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
        </div>
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
                {/* Module Label - Top Left */}
                <div className="week-label">
                  <h2>{week.label}: {week.title}</h2>
                </div>

                {/* Unlock Notice - Future Modules */}
                {isLocked && (
                  <div className="week-overlay">
                    <div className="unlock-message">
                      <p>{week.label}: {week.title} (Will unlock on {week.unlockDate})</p>
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
                        <div 
                          className="washi-tape" 
                          style={{ backgroundColor: ENTRY_TYPES[entry.entryType]?.color || '#3b82f6' }}
                        >
                          <span style={{ position: 'relative', color: 'white', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {ENTRY_TYPES[entry.entryType]?.label || 'Entry'}
                          </span>
                        </div>
                        <div className="card-inner">
                          <div className="card-preview">
                            <p style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 12px 0', color: '#000', lineHeight: '1.4' }}>
                              {entry.title}
                            </p>
                            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', marginBottom: '16px' }}>
                              {entry.content.substring(0, 50)}...
                            </p>
                            <p style={{ fontSize: '11px', color: '#bfdbfe', margin: '0', position: 'absolute', bottom: '12px', right: '12px' }}>
                              {entry.date}
                            </p>
                          </div>
                          {selectedEntry?.id === entry.id && isSignedIn && (
                            <>
                              {/* Delete X Button - Top Right Corner */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteConfirmId(entry.id)
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  padding: '4px 8px',
                                  fontSize: '20px',
                                  background: 'transparent',
                                  color: '#dc2626',
                                  border: 'none',
                                  cursor: 'pointer',
                                  lineHeight: '1'
                                }}
                              >
                                ✕
                              </button>
                              {/* Edit Button - Bottom Right */}
                              <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                                <button 
                                  className="edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedEntry(null)
                                    setFormData({ type: entry.entryType, title: entry.title, content: entry.content })
                                    setEditingEntry(entry)
                                    setShowNewEntry(true)
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Edit
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="envelope-flap"></div>
                      </div>
                    )
                  })}
                </div>

                {/* Add Button & Camera Button - Current Week Only & Signed In */}
                {status === 'current' && !isLocked && isSignedIn && (
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
              <h2>You've completed the Leadership by Design course! 🎉</h2>
              <p>Congratulations on your leadership journey.</p>
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
              <h2>{editingEntry ? 'Edit Entry' : 'New Entry'}</h2>
              <button className="close-btn" onClick={() => { setShowNewEntry(false); setEditingEntry(null) }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Entry Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="insight">{ENTRY_TYPES.insight.label}</option>
                  <option value="learning">{ENTRY_TYPES.learning.label}</option>
                  <option value="growth">{ENTRY_TYPES.growth.label}</option>
                  <option value="speaker-notes">{ENTRY_TYPES['speaker-notes'].label}</option>
                  <option value="events">{ENTRY_TYPES.events.label}</option>
                  <option value="thought">{ENTRY_TYPES.thought.label}</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Give your entry a title..."
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={getContentPlaceholder(formData.type)}
                  rows="6"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" onClick={handleAddEntry}>{editingEntry ? 'Update Entry' : 'Save Entry'}</button>
                {editingEntry && <button className="btn-secondary" onClick={() => { setEditingEntry(null); setShowNewEntry(false) }}>Cancel</button>}
              </div>
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
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#000000',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '13px',
                  fontWeight: '400',
                  borderRadius: '0px',
                  boxSizing: 'border-box',
                  marginBottom: '16px',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
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
              <div>
                <h2>{selectedEntry.date}</h2>
                {selectedEntry.entryType && (
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    {ENTRY_TYPES[selectedEntry.entryType]?.label}
                  </p>
                )}
              </div>
              <button className="close-btn" onClick={() => setSelectedEntry(null)}>✕</button>
            </div>
            <div className="modal-body">
              {selectedEntry.image && (
                <img src={selectedEntry.image} alt="entry" className="detail-image" />
              )}
              {selectedEntry.title && (
                <div className="detail-field">
                  <h3>{selectedEntry.title}</h3>
                </div>
              )}
              {selectedEntry.content && (
                <div className="detail-field">
                  <p>{selectedEntry.content}</p>
                </div>
              )}
              {selectedEntry.caption && (
                <div className="detail-field">
                  <h4>Photo Caption</h4>
                  <p>{selectedEntry.caption}</p>
                </div>
              )}
              <button 
                className="btn-primary"
                onClick={() => {
                  if (selectedEntry.image) {
                    // Photo entry - edit caption
                    setEditingPhotoCaption(selectedEntry.caption || '')
                  } else {
                    // Text entry - edit content
                    setSelectedEntry(null)
                    setFormData({ type: selectedEntry.entryType, title: selectedEntry.title, content: selectedEntry.content })
                    setEditingEntry(selectedEntry)
                    setShowNewEntry(true)
                  }
                }}
                style={{ marginTop: '16px' }}
              >
                {selectedEntry.image ? 'Edit Caption' : 'Edit Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Caption Edit Modal */}
      {editingPhotoCaption !== false && selectedEntry?.image && (
        <div className="overlay" onClick={() => setEditingPhotoCaption(false)}>
          <div className="modal new-entry-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Edit Photo Caption</h2>
              <button className="close-btn" onClick={() => setEditingPhotoCaption(false)}>✕</button>
            </div>
            <div className="modal-body">
              <img src={selectedEntry.image} alt="entry" style={{ width: '100%', marginBottom: '16px', maxHeight: '300px', objectFit: 'cover' }} />
              <div className="form-group">
                <label>Caption</label>
                <input
                  type="text"
                  value={editingPhotoCaption}
                  onChange={(e) => setEditingPhotoCaption(e.target.value)}
                  placeholder="Optional caption..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#000000',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '13px',
                    fontWeight: '400',
                    borderRadius: '0px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb'
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setEntries(entries.map(e => e.id === selectedEntry.id ? { ...e, caption: editingPhotoCaption } : e))
                    setSelectedEntry(null)
                    setEditingPhotoCaption(false)
                  }}
                  style={{ flex: 1 }}
                >
                  Save Caption
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(selectedEntry.id)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '13px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0px',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '700'
                  }}
                >
                  Delete Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal new-entry-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px' }}>
            <div className="modal-header">
              <h2>Delete Entry?</h2>
              <button className="close-btn" onClick={() => setDeleteConfirmId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '24px' }}>
                Are you sure you want to delete this entry? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => {
                    setEntries(entries.filter(e => e.id !== deleteConfirmId))
                    setSelectedEntry(null)
                    setDeleteConfirmId(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '13px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0px',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '700'
                  }}
                >
                  Delete
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '13px',
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '0px',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '700'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal - Optional, can be dismissed */}
      {showSignIn && (
        <div className="overlay" onClick={() => setShowSignIn(false)}>
          <div className="modal new-entry-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Sign In</h2>
              <button className="close-btn" onClick={() => setShowSignIn(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="jhuarachi654@gmail.com"
                  onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#000',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '13px',
                    borderRadius: '0px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#000',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '13px',
                    borderRadius: '0px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {signInError && (
                <p style={{ color: '#dc2626', fontSize: '13px', margin: '8px 0', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {signInError}
                </p>
              )}
              <button className="btn-primary" onClick={handleSignIn} style={{ width: '100%' }}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App