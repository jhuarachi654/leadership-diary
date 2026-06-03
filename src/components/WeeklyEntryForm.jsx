import { useState } from 'react'

export default function WeeklyEntryForm({ onSubmit, onCancel, weekNumber }) {
  const [formData, setFormData] = useState({
    insight: '',
    goal: '',
    action: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.insight.trim() && formData.goal.trim() && formData.action.trim()) {
      onSubmit(formData)
      setFormData({ insight: '', goal: '', action: '' })
    }
  }

  return (
    <div className="form-container">
      <h2>Week {weekNumber} Reflection</h2>
      <p>Document your growth. Three things: an insight, a goal, an action.</p>
      
      <form onSubmit={handleSubmit}>
        {/* Key Insight */}
        <div className="form-group">
          <label style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>
            <span style={{ color: '#2563eb', fontWeight: '600' }}>💡 Key Insight or Learning</span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', fontWeight: '400', marginTop: '0.25rem' }}>
              What's one thing you learned or noticed this week?
            </span>
          </label>
          <textarea
            name="insight"
            value={formData.insight}
            onChange={handleChange}
            placeholder="e.g., I realized that listening more helps me understand different perspectives better..."
            style={{ minHeight: '100px' }}
          />
        </div>

        {/* Goal */}
        <div className="form-group">
          <label style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>
            <span style={{ color: '#2563eb', fontWeight: '600' }}>🎯 Goal (New or Update)</span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', fontWeight: '400', marginTop: '0.25rem' }}>
              What's a goal you're setting? Or an update on a previous goal?
            </span>
          </label>
          <textarea
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            placeholder="e.g., Practice active listening in at least 3 conversations this week..."
            style={{ minHeight: '100px' }}
          />
        </div>

        {/* Action */}
        <div className="form-group">
          <label style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>
            <span style={{ color: '#2563eb', fontWeight: '600' }}>⚡ One Thing I'll Do Differently</span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', fontWeight: '400', marginTop: '0.25rem' }}>
              What's one specific action you'll take?
            </span>
          </label>
          <textarea
            name="action"
            value={formData.action}
            onChange={handleChange}
            placeholder="e.g., In my next team meeting, I'll ask at least 2 follow-up questions instead of jumping to solutions..."
            style={{ minHeight: '100px' }}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save Week {weekNumber}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}