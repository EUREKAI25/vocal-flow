import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import LanguageTrainer from './pages/LanguageTrainer'
import ScatTraining from './pages/ScatTraining'
import ScatCreator from './pages/ScatCreator'
import Progress from './pages/Progress'

function RequireAuth({ children }) {
  const token = localStorage.getItem('vf_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/language" element={<RequireAuth><LanguageTrainer /></RequireAuth>} />
        <Route path="/scat-training" element={<RequireAuth><ScatTraining /></RequireAuth>} />
        <Route path="/scat-creator" element={<RequireAuth><ScatCreator /></RequireAuth>} />
        <Route path="/progress" element={<RequireAuth><Progress /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
