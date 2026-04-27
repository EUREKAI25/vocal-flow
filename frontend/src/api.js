const BASE = import.meta.env.VITE_API_URL || ''

function getToken() {
  return localStorage.getItem('vf_token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  })
  if (res.status === 401) {
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('vf_token')
      window.location.href = '/login'
      return
    }
    const err = await res.json().catch(() => ({ detail: 'Identifiants incorrects' }))
    throw new Error(err.detail || 'Identifiants incorrects')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Erreur serveur')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),

  me: () => request('/auth/me'),

  getRecordings: (program) =>
    request(`/recordings${program ? `?program=${program}` : ''}`),

  saveRecording: (formData) =>
    request('/recordings', { method: 'POST', body: formData }),

  deleteRecording: (id) =>
    request(`/recordings/${id}`, { method: 'DELETE' }),

  getStats: () => request('/progress/stats'),
  getAdvice: () => request('/progress/advice'),
}
