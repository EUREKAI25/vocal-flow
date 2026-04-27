import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const PROGRAM_LABELS = {
  language: '🗣 Langue',
  scat_training: '🎷 Entraînement scat',
  scat_creator: '✨ Création scat',
  transformation: '🔄 Transformation',
}

function ScoreBar({ label, value, color = 'var(--accent)' }) {
  if (value == null) return null
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{Math.round(value)}%</span>
      </div>
      <div className="gauge-bar">
        <div className="gauge-fill" style={{ width: `${Math.round(value)}%`, background: color }} />
      </div>
    </div>
  )
}

export default function Progress() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [advice, setAdvice] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getStats(), api.getAdvice(), api.getRecordings()])
      .then(([s, a, r]) => {
        setStats(s)
        setAdvice(a)
        setRecordings(r)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', color: 'var(--text2)' }}>
        Chargement…
      </div>
    )
  }

  const weekly = stats?.weekly || []
  const monthly = stats?.monthly || []
  const totals = stats?.totals || {}

  return (
    <div className="page" style={{ padding: '24px 20px 40px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '8px 12px' }}>←</button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>📊 Progression</h2>
      </div>

      {/* Totaux */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 14 }}>Sessions enregistrées</h3>
        {Object.keys(PROGRAM_LABELS).map((prog) => (
          <div key={prog} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
            <span>{PROGRAM_LABELS[prog]}</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{totals[prog] || 0}</span>
          </div>
        ))}
      </div>

      {/* Conseil du mois */}
      {advice?.advice && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '3px solid var(--accent)' }}>
          <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 10 }}>🧠 Bilan du mois</h3>
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{advice.advice}</p>
        </div>
      )}

      {/* Stats hebdo */}
      {weekly.map((w) => (
        <div key={w.program} className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, marginBottom: 14, color: 'var(--text)' }}>
            {PROGRAM_LABELS[w.program] || w.program} — 7 derniers jours
          </h3>
          <ScoreBar label="Relief vocal" value={w.avg_relief} color="var(--accent)" />
          <ScoreBar label="Similarité" value={w.avg_similarity} color="var(--accent2)" />
          <ScoreBar label="Rythme" value={w.avg_rhythm} color="var(--accent3)" />
          <ScoreBar label="Intonation" value={w.avg_intonation} color="#22c55e" />
        </div>
      ))}

      {/* Historique récent */}
      {recordings.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 14 }}>Historique récent</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recordings.slice(0, 20).map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '12px',
                  background: 'var(--surface2)',
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                    {PROGRAM_LABELS[r.program] || r.program}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {r.created_at?.slice(0, 16).replace('T', ' ')}
                  </div>
                  {r.comment && (
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, lineHeight: 1.4 }}>
                      {r.comment}
                    </div>
                  )}
                </div>
                {r.relief_label && (
                  <span style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 99,
                    background: 'var(--surface3)',
                    color: 'var(--text2)',
                    flexShrink: 0,
                  }}>
                    {r.relief_label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recordings.length === 0 && weekly.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text2)', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎙</div>
          <p>Lance ta première session pour voir ta progression ici !</p>
        </div>
      )}
    </div>
  )
}
