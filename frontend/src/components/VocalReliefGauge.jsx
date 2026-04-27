const COLORS = {
  'Faible':     '#ef4444',
  'Moyen':      '#f59e0b',
  'Riche':      '#22c55e',
  'Très riche': '#8b5cf6',
}

export default function VocalReliefGauge({ label, score }) {
  if (label == null) return null
  const color = COLORS[label] || '#555'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>Relief vocal</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{label}</span>
      </div>
      <div className="gauge-bar">
        <div className="gauge-fill" style={{ width: `${score ?? 0}%`, background: color }} />
      </div>
    </div>
  )
}
