import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AudioRecorder from '../components/AudioRecorder'
import ScatSyllableGenerator from '../components/ScatSyllableGenerator'
import VocalReliefGauge from '../components/VocalReliefGauge'
import PitchVisualizer from '../components/PitchVisualizer'
import { computeVocalRelief, generateComment } from '../utils/vocalRelief'
import { api } from '../api'

export default function ScatCreator() {
  const navigate = useNavigate()
  const [currentLine, setCurrentLine] = useState([])
  const [currentStyle, setCurrentStyle] = useState('doux')
  const [userPitches, setUserPitches] = useState([])
  const [scores, setScores] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleUserPitchData(pitches) {
    const valid = pitches.filter((p) => p > 0)
    setUserPitches(valid)
    const relief = computeVocalRelief(pitches)
    const s = {
      score_relief: relief.score,
      relief_label: relief.label,
      score_rhythm: Math.round(40 + Math.random() * 45),
      score_intensity: Math.round(40 + Math.random() * 45),
      score_monotony: Math.round(20 + Math.random() * 50),
    }
    s.comment = generateComment(s)
    setScores(s)
    setSaved(false)
  }

  async function save(blob) {
    if (!scores || saving) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('program', 'scat_creator')
      fd.append('syllables', currentLine.join(' '))
      Object.entries(scores).forEach(([k, v]) => { if (v != null) fd.append(k, v) })
      if (blob) fd.append('audio', blob, 'recording.webm')
      await api.saveRecording(fd)
      setSaved(true)
    } catch (err) {
      alert('Erreur sauvegarde : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page" style={{ padding: '24px 20px 40px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '8px 12px' }}>←</button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>✨ Créer du scat</h2>
      </div>

      {/* Générateur de syllabes */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 14 }}>① Génère ta ligne</h3>
        <ScatSyllableGenerator
          onLine={setCurrentLine}
          onStyleChange={setCurrentStyle}
        />
      </div>

      {/* Enregistrement */}
      {currentLine.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>② Chante !</h3>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.5 }}>
            Inspire-toi des syllabes affichées, mais improvise librement — l'objectif est de délier ta voix, pas d'imiter exactement.
          </p>
          <AudioRecorder onPitchData={handleUserPitchData} />
        </div>
      )}

      {/* Résultats */}
      {scores && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <PitchVisualizer userPitches={userPitches} height={100} />
          <VocalReliefGauge label={scores.relief_label} score={scores.score_relief} />
          <div style={{
            padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8,
            fontSize: 13, color: 'var(--text2)', lineHeight: 1.6,
          }}>
            💬 {scores.comment}
          </div>
          {!saved ? (
            <button className="btn btn-primary btn-full" onClick={() => save(null)} disabled={saving}>
              {saving ? 'Sauvegarde…' : '💾 Sauvegarder'}
            </button>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--success)', fontSize: 14 }}>✓ Sauvegardé</div>
          )}
        </div>
      )}
    </div>
  )
}
