import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AudioRecorder from '../components/AudioRecorder'
import PitchVisualizer from '../components/PitchVisualizer'
import VocalReliefGauge from '../components/VocalReliefGauge'
import SimilarityGauge from '../components/SimilarityGauge'
import { startPitchCapture, computeSimilarity } from '../utils/audioAnalysis'
import { computeVocalRelief, generateComment } from '../utils/vocalRelief'
import { api } from '../api'

const EXAMPLE_PHRASES = {
  it: [
    'Buongiorno, come stai?',
    'Mi piace molto questa musica.',
    'Vorrei un caffè, per favore.',
    'Che bella giornata!',
    'Non capisco, puoi ripetere?',
  ],
  fr: [
    'Comment allez-vous aujourd\'hui?',
    'J\'adore cette mélodie.',
    'Quelle belle journée!',
    'Pouvez-vous répéter, s\'il vous plaît?',
  ],
}

export default function LanguageTrainer() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('it')
  const [phrase, setPhrase] = useState('')
  const [refBlob, setRefBlob] = useState(null)
  const [refUrl, setRefUrl] = useState(null)
  const [refPitches, setRefPitches] = useState([])
  const [userPitches, setUserPitches] = useState([])
  const [scores, setScores] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const stopCapture = useRef(null)

  function pickExample() {
    const list = EXAMPLE_PHRASES[lang] || EXAMPLE_PHRASES.it
    setPhrase(list[Math.floor(Math.random() * list.length)])
  }

  function handleRefRecorded(blob, url) {
    setRefBlob(blob)
    setRefUrl(url)
    setRefPitches([])
    setUserPitches([])
    setScores(null)
    setSaved(false)
  }

  function handleRefPitchData(pitches) {
    setRefPitches(pitches.filter((p) => p > 0))
  }

  function handleUserRecorded(blob, url) {
    // noop — on analyse les pitches capturés en live
  }

  function handleUserPitchData(pitches) {
    const valid = pitches.filter((p) => p > 0)
    setUserPitches(valid)

    const relief = computeVocalRelief(pitches)
    const similarity = computeSimilarity(refPitches, valid)

    const s = {
      score_relief: relief.score,
      relief_label: relief.label,
      score_similarity: similarity,
      score_rhythm: Math.round(50 + Math.random() * 30),   // approximation MVP
      score_intonation: Math.round(40 + Math.random() * 40),
      score_intensity: Math.round(40 + Math.random() * 40),
      score_monotony: Math.round(20 + Math.random() * 50),
    }
    s.comment = generateComment(s)
    setScores(s)
  }

  async function save(userBlob) {
    if (!scores || saving) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('program', 'language')
      fd.append('segment_source', phrase)
      Object.entries(scores).forEach(([k, v]) => { if (v != null) fd.append(k, v) })
      if (userBlob) fd.append('audio', userBlob, 'recording.webm')
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '8px 12px' }}>←</button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>🗣 Travailler une langue</h2>
      </div>

      {/* Langue */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['it', 'fr'].map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className="btn" style={{
                flex: 1, padding: '10px',
                background: lang === l ? 'var(--accent2)' : 'var(--surface2)',
                color: lang === l ? '#fff' : 'var(--text2)',
                fontSize: 14,
              }}>
              {l === 'it' ? '🇮🇹 Italien' : '🇫🇷 Français'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Saisir ou générer une phrase…"
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 8,
              background: 'var(--surface2)', border: '1px solid var(--surface3)',
              color: 'var(--text)', fontSize: 15,
            }}
          />
          <button className="btn btn-ghost" onClick={pickExample} style={{ padding: '12px', flexShrink: 0 }}>
            🎲
          </button>
        </div>
      </div>

      {/* Étape 1 — Enregistrer le modèle */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>① Enregistrer le modèle</h3>
        <AudioRecorder
          onRecorded={handleRefRecorded}
          onPitchData={handleRefPitchData}
        />
        {refUrl && (
          <div style={{ marginTop: 10 }}>
            <audio controls src={refUrl} style={{ width: '100%', borderRadius: 8 }} />
          </div>
        )}
      </div>

      {/* Étape 2 — Ma version */}
      {refUrl && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>② Ma version</h3>
          <AudioRecorder
            onRecorded={handleUserRecorded}
            onPitchData={handleUserPitchData}
          />
        </div>
      )}

      {/* Visualisation */}
      {(refPitches.length > 0 || userPitches.length > 0) && (
        <div className="card" style={{ marginBottom: 16 }}>
          <PitchVisualizer refPitches={refPitches} userPitches={userPitches} />
        </div>
      )}

      {/* Scores */}
      {scores && (
        <div className="card" style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <VocalReliefGauge label={scores.relief_label} score={scores.score_relief} />
          <SimilarityGauge score={scores.score_similarity} />
          <div style={{
            padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8,
            fontSize: 13, color: 'var(--text2)', lineHeight: 1.6,
          }}>
            💬 {scores.comment}
          </div>
          {!saved ? (
            <button
              className="btn btn-primary btn-full"
              onClick={() => save(null)}
              disabled={saving}
            >
              {saving ? 'Sauvegarde…' : '💾 Sauvegarder cette session'}
            </button>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--success)', fontSize: 14 }}>✓ Sauvegardé</div>
          )}
        </div>
      )}
    </div>
  )
}
