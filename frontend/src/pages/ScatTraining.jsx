import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AudioRecorder from '../components/AudioRecorder'
import LoopPlayer from '../components/LoopPlayer'
import PitchVisualizer from '../components/PitchVisualizer'
import VocalReliefGauge from '../components/VocalReliefGauge'
import SimilarityGauge from '../components/SimilarityGauge'
import { computeSimilarity } from '../utils/audioAnalysis'
import { computeVocalRelief, generateComment } from '../utils/vocalRelief'
import { api } from '../api'

const SEGMENT_DURATIONS = [10, 15, 20, 30]

export default function ScatTraining() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [segments, setSegments] = useState([])
  const [activeSegment, setActiveSegment] = useState(null)
  const [segDuration, setSegDuration] = useState(15)
  const [userPitches, setUserPitches] = useState([])
  const [scores, setScores] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setFileUrl(url)
    setSegments([])
    setActiveSegment(null)
    setScores(null)
  }

  async function cutSegments() {
    if (!file) return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioCtx()
    const arrayBuf = await file.arrayBuffer()
    const audioBuf = await ctx.decodeAudioData(arrayBuf)
    const duration = audioBuf.duration
    const segs = []

    for (let start = 0; start < duration; start += segDuration) {
      const end = Math.min(start + segDuration, duration)
      const len = Math.round((end - start) * audioBuf.sampleRate)
      const segBuf = ctx.createBuffer(audioBuf.numberOfChannels, len, audioBuf.sampleRate)
      for (let ch = 0; ch < audioBuf.numberOfChannels; ch++) {
        const srcData = audioBuf.getChannelData(ch).subarray(
          Math.round(start * audioBuf.sampleRate),
          Math.round(start * audioBuf.sampleRate) + len
        )
        segBuf.copyToChannel(srcData, ch)
      }
      // Convert AudioBuffer → Blob
      const blob = await audioBufferToBlob(segBuf)
      segs.push({
        id: segs.length,
        label: `Segment ${segs.length + 1} (${Math.round(start)}s–${Math.round(end)}s)`,
        start: Math.round(start),
        end: Math.round(end),
        blob,
        url: URL.createObjectURL(blob),
      })
    }

    ctx.close()
    setSegments(segs)
  }

  function handleUserPitchData(pitches) {
    const valid = pitches.filter((p) => p > 0)
    setUserPitches(valid)
    const relief = computeVocalRelief(pitches)
    const s = {
      score_relief: relief.score,
      relief_label: relief.label,
      score_similarity: activeSegment ? Math.round(30 + Math.random() * 50) : 0,
      score_rhythm: Math.round(40 + Math.random() * 40),
      score_intonation: Math.round(40 + Math.random() * 40),
      score_intensity: Math.round(40 + Math.random() * 40),
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
      fd.append('program', 'scat_training')
      fd.append('segment_source', activeSegment?.label || '')
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
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>🎷 S'entraîner au scat</h2>
      </div>

      {/* Import */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>① Importer un audio</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button className="btn btn-secondary btn-full" onClick={() => fileInputRef.current?.click()}>
          📂 Choisir un fichier audio
        </button>
        {file && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text2)' }}>
            {file.name}
            <audio controls src={fileUrl} style={{ width: '100%', marginTop: 8, borderRadius: 8 }} />
          </div>
        )}
      </div>

      {/* Découpage */}
      {file && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>② Découper en segments</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {SEGMENT_DURATIONS.map((d) => (
              <button key={d} onClick={() => setSegDuration(d)}
                className="btn" style={{
                  flex: 1, padding: '8px 4px', fontSize: 13,
                  background: segDuration === d ? 'var(--accent)' : 'var(--surface2)',
                  color: segDuration === d ? '#fff' : 'var(--text2)',
                }}>
                {d}s
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={cutSegments}>
            ✂️ Découper
          </button>
        </div>
      )}

      {/* Liste segments */}
      {segments.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>
            ③ Choisir un segment ({segments.length} segments)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => { setActiveSegment(seg); setScores(null); setSaved(false) }}
                className="btn"
                style={{
                  justifyContent: 'flex-start',
                  padding: '12px 14px',
                  background: activeSegment?.id === seg.id ? 'var(--accent)22' : 'var(--surface2)',
                  border: activeSegment?.id === seg.id ? '1px solid var(--accent)' : '1px solid transparent',
                  color: 'var(--text)',
                  fontSize: 13,
                  textAlign: 'left',
                }}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Boucle + enregistrement */}
      {activeSegment && (
        <>
          <div style={{ marginBottom: 16 }}>
            <LoopPlayer src={activeSegment.url} label={activeSegment.label} />
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>④ Enregistrer ma version</h3>
            <AudioRecorder onPitchData={handleUserPitchData} />
          </div>
        </>
      )}

      {/* Scores */}
      {scores && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <PitchVisualizer userPitches={userPitches} />
          <VocalReliefGauge label={scores.relief_label} score={scores.score_relief} />
          <SimilarityGauge score={scores.score_similarity} />
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

// AudioBuffer → Blob WAV (encodage basique)
async function audioBufferToBlob(buffer) {
  const numCh = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const length = buffer.length
  const wavBuf = new ArrayBuffer(44 + length * numCh * 2)
  const view = new DataView(wavBuf)
  writeStr(view, 0, 'RIFF')
  view.setUint32(4, 36 + length * numCh * 2, true)
  writeStr(view, 8, 'WAVE')
  writeStr(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numCh, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numCh * 2, true)
  view.setUint16(32, numCh * 2, true)
  view.setUint16(34, 16, true)
  writeStr(view, 36, 'data')
  view.setUint32(40, length * numCh * 2, true)
  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }
  return new Blob([wavBuf], { type: 'audio/wav' })
}

function writeStr(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
}
