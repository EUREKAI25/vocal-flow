import { useEffect, useRef, useState } from 'react'

const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']

function getSupportedMime() {
  return MIME_TYPES.find((m) => MediaRecorder.isTypeSupported(m)) || ''
}

/**
 * props:
 *   onRecorded(blob, url) — appelé quand l'enregistrement est terminé
 *   onPitchData(pitches)  — tableau de pitch capturé pendant l'enregistrement
 *   maxSeconds            — durée max (défaut 120s)
 */
export default function AudioRecorder({ onRecorded, onPitchData, maxSeconds = 120 }) {
  const [state, setState] = useState('idle') // idle | recording | done
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)

  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const pitchesRef = useRef([])
  const ctxRef = useRef(null)
  const processorRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const analyserRef = useRef(null)

  function drawWaveform() {
    const canvas = canvasRef.current
    if (!canvas || !analyserRef.current) return
    const ctx2d = canvas.getContext('2d')
    const buf = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteTimeDomainData(buf)
    ctx2d.clearRect(0, 0, canvas.width, canvas.height)
    ctx2d.strokeStyle = '#8b5cf6'
    ctx2d.lineWidth = 2
    ctx2d.beginPath()
    const sliceWidth = canvas.width / buf.length
    let x = 0
    for (let i = 0; i < buf.length; i++) {
      const v = buf[i] / 128
      const y = (v * canvas.height) / 2
      i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y)
      x += sliceWidth
    }
    ctx2d.stroke()
    animRef.current = requestAnimationFrame(drawWaveform)
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Waveform via AnalyserNode
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      ctxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyserRef.current = analyser
      source.connect(analyser)

      // MediaRecorder
      const mime = getSupportedMime()
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {})
      mediaRef.current = recorder
      chunksRef.current = []
      pitchesRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setState('done')
        onRecorded?.(blob, url)
        onPitchData?.(pitchesRef.current)
      }

      recorder.start(100)
      setState('recording')
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d + 1 >= maxSeconds) {
            stopRecording()
            return d + 1
          }
          return d + 1
        })
      }, 1000)

      drawWaveform()
    } catch (err) {
      alert('Accès micro refusé : ' + err.message)
    }
  }

  function stopRecording() {
    clearInterval(timerRef.current)
    cancelAnimationFrame(animRef.current)
    if (mediaRef.current?.state === 'recording') mediaRef.current.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (ctxRef.current?.state !== 'closed') ctxRef.current?.close().catch(() => {})
  }

  function reset() {
    setAudioUrl(null)
    setDuration(0)
    setState('idle')
  }

  useEffect(() => () => { stopRecording() }, [])

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <canvas
        ref={canvasRef}
        width={340}
        height={60}
        style={{
          width: '100%',
          height: 60,
          borderRadius: 8,
          background: 'var(--surface2)',
          display: state === 'recording' ? 'block' : 'none',
        }}
      />

      {state === 'done' && audioUrl && (
        <audio controls src={audioUrl} style={{ width: '100%', borderRadius: 8 }} />
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {state === 'idle' && (
          <button className="btn btn-primary btn-full" onClick={startRecording}>
            🎙 Enregistrer
          </button>
        )}
        {state === 'recording' && (
          <button className="btn btn-danger btn-full" onClick={stopRecording}>
            ⏹ Stop — {fmt(duration)}
          </button>
        )}
        {state === 'done' && (
          <>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={startRecording}>
              🔄 Réessayer
            </button>
            <button className="btn btn-ghost" onClick={reset}>✕</button>
          </>
        )}
      </div>
    </div>
  )
}
