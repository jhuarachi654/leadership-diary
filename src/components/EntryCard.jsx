export default function EntryCard({ entry, index }) {
  if (entry.type === 'baseline') {
    return (
      <div className="entry-card" style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="entry-header">
          <span className="entry-type">Baseline</span>
          <span className="entry-date">{entry.date}</span>
        </div>

        <div className="entry-content">
          <h3>Your Starting Point</h3>

          {/* SCARF Summary */}
          <div className="entry-section">
            <div className="entry-section-label">SCARF Assessment</div>
            <div className="baseline-summary">
              {entry.scarfStatus && (
                <div className="baseline-item">
                  <div className="baseline-item-label">Status</div>
                  <div className="baseline-item-value">{entry.scarfStatus}</div>
                </div>
              )}
              {entry.scarfAutonomy && (
                <div className="baseline-item">
                  <div className="baseline-item-label">Autonomy</div>
                  <div className="baseline-item-value">{entry.scarfAutonomy}</div>
                </div>
              )}
              {entry.scarfRelatedness && (
                <div className="baseline-item">
                  <div className="baseline-item-label">Relatedness</div>
                  <div className="baseline-item-value">{entry.scarfRelatedness}</div>
                </div>
              )}
              {entry.scarfFairness && (
                <div className="baseline-item">
                  <div className="baseline-item-label">Fairness</div>
                  <div className="baseline-item-value">{entry.scarfFairness}</div>
                </div>
              )}
              {entry.scarfCertainty && (
                <div className="baseline-item">
                  <div className="baseline-item-label">Certainty</div>
                  <div className="baseline-item-value">{entry.scarfCertainty}</div>
                </div>
              )}
            </div>
          </div>

          {/* VIA Strengths */}
          {entry.viaStrengths && (
            <div className="entry-section">
              <div className="entry-section-label">VIA Character Strengths</div>
              <div className="entry-section-content">{entry.viaStrengths}</div>
            </div>
          )}

          {/* Superpowers */}
          {entry.superpowers && (
            <div className="entry-section">
              <div className="entry-section-label">Your Superpowers</div>
              <div className="entry-section-content">{entry.superpowers}</div>
            </div>
          )}

          {/* Reflection */}
          {entry.reflection && (
            <div className="entry-section">
              <div className="entry-section-label">Initial Reflection</div>
              <div className="entry-section-content">{entry.reflection}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Weekly Entry
  if (entry.type === 'weekly') {
    return (
      <div className="entry-card" style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="entry-header">
          <span className="entry-type">Week {entry.week}</span>
          <span className="entry-date">{entry.date}</span>
        </div>

        <div className="entry-content">
          {/* Insight */}
          {entry.insight && (
            <div className="entry-section">
              <div className="entry-section-label">💡 Key Insight</div>
              <div className="entry-section-content">{entry.insight}</div>
            </div>
          )}

          {/* Goal */}
          {entry.goal && (
            <div className="entry-section">
              <div className="entry-section-label">🎯 Goal</div>
              <div className="entry-section-content">{entry.goal}</div>
            </div>
          )}

          {/* Action */}
          {entry.action && (
            <div className="entry-section">
              <div className="entry-section-label">⚡ Action</div>
              <div className="entry-section-content">{entry.action}</div>
            </div>
          )}
        </div>
      </div>
    )
  }
}