import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(username, password)
      localStorage.setItem('vf_token', data.access_token)
      localStorage.setItem('vf_user', data.username)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎙</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>vocalFlow</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            Entraînement vocal personnel
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={{
              padding: '14px 16px',
              borderRadius: 10,
              background: 'var(--surface)',
              border: '1px solid var(--surface3)',
              color: 'var(--text)',
              fontSize: 16,
            }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              padding: '14px 16px',
              borderRadius: 10,
              background: 'var(--surface)',
              border: '1px solid var(--surface3)',
              color: 'var(--text)',
              fontSize: 16,
            }}
          />
          {error && (
            <div style={{ color: 'var(--error)', fontSize: 13, textAlign: 'center' }}>{error}</div>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ padding: '16px', fontSize: 16, marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
