import { useNavigate } from 'react-router-dom'

const PROGRAMS = [
  {
    id: 'language',
    emoji: '🗣',
    title: 'Travailler une langue',
    desc: 'Intonation, rythme, musicalité — compare ta voix au modèle',
    color: '#06b6d4',
    path: '/language',
  },
  {
    id: 'scat_training',
    emoji: '🎷',
    title: "S'entraîner au scat",
    desc: "Importe un audio, découpe en segments, boucle et imite",
    color: '#8b5cf6',
    path: '/scat-training',
  },
  {
    id: 'scat_creator',
    emoji: '✨',
    title: 'Créer du scat',
    desc: 'Karaoké syllabique — délie ton vocabulaire vocal',
    color: '#f59e0b',
    path: '/scat-creator',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const user = localStorage.getItem('vf_user') || 'toi'

  function logout() {
    localStorage.removeItem('vf_token')
    localStorage.removeItem('vf_user')
    navigate('/login')
  }

  return (
    <div className="page" style={{ padding: '48px 20px 32px', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>🎙 vocalFlow</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 2 }}>Bonjour {user} 👋</p>
        </div>
        <button
          onClick={() => navigate('/progress')}
          style={{
            background: 'var(--surface)',
            border: 'none',
            color: 'var(--text2)',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          📊 Progression
        </button>
      </div>

      {/* Programmes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PROGRAMS.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(p.path)}
            style={{
              background: 'var(--surface)',
              border: `1px solid ${p.color}22`,
              borderRadius: 16,
              padding: '22px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s, transform 0.1s',
              display: 'flex',
              gap: 18,
              alignItems: 'center',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `${p.color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                flexShrink: 0,
              }}
            >
              {p.emoji}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: p.color, marginBottom: 4 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4 }}>{p.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text3)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
