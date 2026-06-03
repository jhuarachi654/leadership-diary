import { useState } from 'react'

export default function BaselineForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    scarfStatus: '',
    scarfAutonomy: '',
    scarfRelatedness: '',
    scarfFairness: '',
    scarfCertainty: '',
    viaStrengths: '',
    superpowers: '',
    reflection: ''
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
    onSubmit(formData)
  }

  return (
    <div className="form-container">
      <h2>Launch Your Leadership Diary</h2>
      <p>Let's establish your baseline. Fill in your assessment results and share what you noticed.</p>
      
      <form onSubmit={handleSubmit}>
        {/* SCARF Assessment */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#2563eb' }}>
            SCARF Assessment
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
            Rate each dimension (1-10 or describe)
          </p>
          
          <div className="assessment-grid">
            <div className="assessment-input">
              <label>Status</label>
              <input
                type="text"
                name="scarfStatus"
                value={formData.scarfStatus}
                onChange={handleChange}
                placeholder="e.g., 7/10 or 'feeling confident'"
              />
            </div>
            <div className="assessment-input">
              <label>Autonomy</label>
              <input
                type="text"
                name="scarfAutonomy"
                value={formData.scarfAutonomy}
                onChange={handleChange}
                placeholder="e.g., 6/10"
              />
            </div>
            <div className="assessment-input">
              <label>Relatedness</label>
              <input
                type="text"
                name="scarfRelatedness"
                value={formData.scarfRelatedness}
                onChange={handleChange}
                placeholder="e.g., 8/10"
              />
            </div>
            <div className="assessment-input">
              <label>Fairness</label>
              <input
                type="text"
                name="scarfFairness"
                value={formData.scarfFairness}
                onChange={handleChange}
                placeholder="e.g., 7/10"
              />
            </div>
            <div className="assessment-input">
              <label>Certainty</label>
              <input
                type="text"
                name="scarfCertainty"
                value={formData.scarfCertainty}
                onChange={handleChange}
                placeholder="e.g., 6/10"
              />
            </div>
          </div>
        </div>

        {/* VIA Assessment */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>
            <span style={{ color: '#2563eb', fontWeight: '600' }}>VIA Character Strengths</span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', fontWeight: '400', marginTop: '0.25rem' }}>
              List your top 3-5 strengths
            </span>
          </label>
          <textarea
            name="viaStrengths"
            value={formData.viaStrengths}
            onChange={handleChange}
            placeholder="e.g., Creativity, Honesty, Love of Learning..."
            style={{ minHeight: '100px' }}
          />
        </div>

        {/* Superpowers */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>
            <span style={{ color: '#2563eb', fontWeight: '600' }}>Your Superpowers</span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', fontWeight: '400', marginTop: '0.25rem' }}>
              What are you naturally exceptional at?
            </span>
          </label>
          <textarea
            name="superpowers"
            value={formData.superpowers}
            onChange={handleChange}
            placeholder="e.g., Building trust, solving complex problems, making people feel heard..."
            style={{ minHeight: '100px' }}
          />
        </div>

        {/* Reflection */}
        <div className="form-group">
          <label style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>
            <span style={{ color: '#2563eb', fontWeight: '600' }}>Initial Reflection</span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', fontWeight: '400', marginTop: '0.25rem' }}>
              What did you notice across all three assessments?
            </span>
          </label>
          <textarea
            name="reflection"
            value={formData.reflection}
            onChange={handleChange}
            placeholder="Share what patterns, surprises, or insights stood out to you..."
            style={{ minHeight: '150px' }}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Launch My Diary
          </button>
        </div>
      </form>
    </div>
  )
}