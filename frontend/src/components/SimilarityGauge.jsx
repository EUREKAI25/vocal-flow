export default function SimilarityGauge({ score }) {
  if (score == null) return null
  const color = score > 70 ? '#22c55e' : score > 40 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>Similarité</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{score}%</span>
      </div>
      <div className="gauge-bar">
        <div className="gauge-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  )
}
