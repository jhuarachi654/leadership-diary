import { useState, useEffect, useRef } from 'react'
import './App.css'
import ShinyStarImg from './assets/stars/Shiny_star_01_2x.png'
import TwoStarsImg from './assets/stars/Two_stars_2x.png'
import SparklesImg from './assets/stars/Two_basic_sparcles_02_2x.png'

const StarInsight = () => <img src={ShinyStarImg} alt="insight" className="star-icon" />
const StarGoal = () => <img src={TwoStarsImg} alt="goal" className="star-icon" />
const StarAction = () => <img src={SparklesImg} alt="action" className="star-icon" />

function App() {
  const [entries, setEntries] = useState([])
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [formData, setFormData] = useState({ 
    insight: '', 
    goal: '', 
    action: '', 
    image: null 
  })
  const [dragActive, setDragActive] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [positions, setPositions] = useState({})
  const [pendingPhoto, setPendingPhoto] = useState(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const scatterRef = useRef(null)
  const captionInputRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('leadershipDiary')
    if (saved) {
      setEntries(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('leadershipDiary', JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    if (pendingPhoto && captionInputRef.current) {
      captionInputRef.current.focus()
    }
  }, [pendingPhoto])

  const handleImageUpload = async (file) => {
    if (file && file.type.startsWith('image/')) {
      const form = new FormData()
      form.append('photo', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (res.ok) {
        const { url } = await res.json()
        setFormData(prev => ({ ...prev, image: url }))
      }
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleImageUpload(files[0])
    }
  }

  const handleAddEntry = () => {
    if (formData.insight.trim() || formData.goal.trim() || formData.action.trim()) {
      const newEntry = {
        id: Date.now(),
        type: 'text',
        date: new Date().toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }),
        insight: formData.insight,
        goal: formData.goal,
        action: formData.action,
        image: formData.image
      }
      setEntries([newEntry, ...entries])
      setFormData({ 
        insight: '', 
        goal: '', 
        action: '', 
        image: null 
      })
      setShowNewEntry(false)
    }
  }

  const handlePhotoUpload = async (file) => {
    if (file && file.type.startsWith('image/')) {
      const form = new FormData()
      form.append('photo', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (res.ok) {
        const { url } = await res.json()
        setPendingPhoto(url)
        setPhotoCaption('')
      }
    }
  }

  const savePendingPhoto = () => {
    if (pendingPhoto) {
      const photoEntry = {
        id: Date.now(),
        type: 'photo',
        image: pendingPhoto,
        caption: photoCaption,
        date: new Date().toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        })
      }
      setEntries([photoEntry, ...entries])
      setPendingPhoto(null)
      setPhotoCaption('')
    }
  }

  // Dragging logic
  const handleMouseDown = (e, entryId) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return
    }
    setDraggingId(entryId)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e) => {
    if (draggingId === null || !scatterRef.current) return

    const containerRect = scatterRef.current.getBoundingClientRect()
    const newLeft = e.clientX - containerRect.left - dragOffset.x
    const newTop = e.clientY - containerRect.top - dragOffset.y

    setPositions(prev => ({
      ...prev,
      [draggingId]: {
        left: Math.max(0, Math.min(newLeft, containerRect.width - 280)),
        top: Math.max(0, newTop)
      }
    }))
  }

  const handleMouseUp = () => {
    setDraggingId(null)
  }

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

  return (
    <div className="app" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <header className="header">
        <div className="header-content">
          <h1>Leadership Diary Reflection</h1>
          <p className="tagline">{entries.length} entries</p>
        </div>
      </header>

      <div className="canvas">
        <div className="timestamp">
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })} {currentTime.toLocaleTimeString('en-US')}
        </div>

        <div className="scatter-container" ref={scatterRef}>
          {entries.map((entry, i) => {
            if (entry.type === 'photo') {
              const defaultPositions = [
                { left: '20%', top: `${i * 200 + 100}px`, rotate: -8 },
                { left: '70%', top: `${i * 200 + 150}px`, rotate: 5 },
                { left: '15%', top: `${i * 200 + 200}px`, rotate: 3 },
              ]
              const defaultPos = defaultPositions[i % 3]
              const customPos = positions[entry.id]

              return (
                <div
                  key={entry.id}
                  className="polaroid floating"
                  style={{
                    left: customPos ? `${customPos.left}px` : defaultPos.left,
                    top: customPos ? `${customPos.top}px` : defaultPos.top,
                    transform: `rotate(${defaultPos.rotate}deg)`,
                    cursor: draggingId === entry.id ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, entry.id)}
                >
                  <img src={entry.image} alt="memory" />
                  <div className="polaroid-content">
                    {entry.caption && <div className="polaroid-caption">{entry.caption}</div>}
                    <div className="polaroid-date">{entry.date}</div>
                  </div>
                </div>
              )
            }

            // Text entry (envelope style)
            const textPositions = [
              { left: '15%', top: `${i * 200 + 20}px`, rotate: -3 },
              { left: '60%', top: `${i * 200 + 80}px`, rotate: 2 },
              { left: '10%', top: `${i * 200 + 160}px`, rotate: 1 },
              { left: '65%', top: `${i * 200 + 40}px`, rotate: -2 },
            ]
            const textDefaultPos = textPositions[i % 4]
            const textCustomPos = positions[entry.id]

            return (
              <div
                key={entry.id}
                className="entry-card scattered floating"
                style={{
                  left: textCustomPos ? `${textCustomPos.left}px` : textDefaultPos.left,
                  top: textCustomPos ? `${textCustomPos.top}px` : textDefaultPos.top,
                  transform: `rotate(${textDefaultPos.rotate}deg)`,
                  cursor: draggingId === entry.id ? 'grabbing' : 'grab',
                }}
                onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                onMouseDown={(e) => handleMouseDown(e, entry.id)}
              >
                <div className="washi-tape"></div>
                <div className="card-inner">
                  <div className="card-date">{entry.date}</div>
                  <div className="card-preview">
                    {entry.insight && <p>💡 {entry.insight.substring(0, 50)}...</p>}
                  </div>
                </div>
                <div className="envelope-flap"></div>
              </div>
            )
          })}
        </div>

        <button className="plus-button" onClick={() => setShowNewEntry(!showNewEntry)}>
          +
        </button>

        <button className="camera-button" onClick={() => document.getElementById('camera-input').click()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
        <input
          type="file"
          id="camera-input"
          accept="image/*"
          onChange={(e) => e.target.files && handlePhotoUpload(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {showNewEntry && (
          <div className="letter-overlay" onClick={() => setShowNewEntry(false)}>
            <div className="letter" onClick={(e) => e.stopPropagation()}>
              <div className="letter-header">
                <h2>New Entry</h2>
                <button className="close-btn" onClick={() => setShowNewEntry(false)}>✕</button>
              </div>

              <div className="letter-content">
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

                <button className="btn-save" onClick={handleAddEntry}>
                  Save Entry
                </button>
              </div>
              <div className="letter-flap"></div>
            </div>
          </div>
        )}

        {pendingPhoto && (
          <div className="caption-overlay" onClick={() => setPendingPhoto(null)}>
            <div className="caption-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Add Caption</h2>
              <img src={pendingPhoto} alt="preview" className="caption-preview" />
              <input
                ref={captionInputRef}
                type="text"
                placeholder="Optional caption for your photo..."
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    savePendingPhoto()
                  }
                }}
              />
              <div className="caption-actions">
                <button className="btn-caption-save" onClick={savePendingPhoto}>Save Photo</button>
                <button className="btn-caption-cancel" onClick={() => setPendingPhoto(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {selectedEntry && !showNewEntry && (
          <div className="letter-overlay" onClick={() => setSelectedEntry(null)}>
            <div className="letter detail" onClick={(e) => e.stopPropagation()}>
              <div className="letter-header">
                <h2>{selectedEntry.date}</h2>
                <button className="close-btn" onClick={() => setSelectedEntry(null)}>✕</button>
              </div>
              <div className="letter-content">
                {selectedEntry.image && (
                  <div className="entry-image">
                    <img src={selectedEntry.image} alt="entry" />
                  </div>
                )}
                {selectedEntry.insight && (
                  <div className="detail-section">
                    <h3><StarInsight /> Insight</h3>
                    <p>{selectedEntry.insight}</p>
                  </div>
                )}
                {selectedEntry.goal && (
                  <div className="detail-section">
                    <h3><StarGoal /> Goal</h3>
                    <p>{selectedEntry.goal}</p>
                  </div>
                )}
                {selectedEntry.action && (
                  <div className="detail-section">
                    <h3><StarAction /> Action</h3>
                    <p>{selectedEntry.action}</p>
                  </div>
                )}
              </div>
              <div className="letter-flap"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App