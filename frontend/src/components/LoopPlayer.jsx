import { useEffect, useRef, useState } from 'react'

const SPEEDS = [0.5, 0.75, 0.9, 1.0]

/**
 * Lecture en boucle d'un segment audio avec contrôle de vitesse.
 * props:
 *   src       — URL audio (blob ou distant)
 *   label     — label du segment
 *   onEnd     — callback quand on arrête
 */
export default function LoopPlayer({ src, label, onEnd }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1.0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true
    audio.playbackRate = speed
  }, [speed])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) { audio.pause(); audio.currentTime = 0 }
    setPlaying(false)
  }, [src])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.playbackRate = speed
      audio.play()
      setPlaying(true)
    }
  }

  function stop() {
    const audio = audioRef.current
    if (audio) { audio.pause(); audio.currentTime = 0 }
    setPlaying(false)
    onEnd?.()
  }

  function setSpeedAndApply(s) {
    setSpeed(s)
    if (audioRef.current) audioRef.current.playbackRate = s
  }

  if (!src) return null

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <audio ref={audioRef} src={src} />
      <div style={{ fontSize: 14, color: 'var(--text2)' }}>{label || 'Segment'}</div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={togglePlay}>
          {playing ? '⏸ Pause' : '▶ Écouter en boucle'}
        </button>
        <button className="btn btn-ghost" onClick={stop}>⏹</button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>Vitesse :</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeedAndApply(s)}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: speed === s ? 'var(--accent)' : 'var(--surface2)',
              color: speed === s ? '#fff' : 'var(--text2)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {s === 1 ? '1×' : `${s}×`}
          </button>
        ))}
      </div>
    </div>
  )
}
