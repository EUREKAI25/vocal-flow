import { useEffect, useRef } from 'react'

/**
 * Affiche une ou deux courbes de pitch sur un canvas.
 * props:
 *   refPitches  — array de Hz (référence, violet)
 *   userPitches — array de Hz (utilisateur, cyan)
 *   height      — hauteur du canvas (défaut 120)
 */
export default function PitchVisualizer({ refPitches = [], userPitches = [], height = 120 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const allPitches = [...refPitches, ...userPitches].filter((p) => p > 0)
    if (!allPitches.length) {
      ctx.fillStyle = 'var(--surface2)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#555'
      ctx.font = '13px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Aucune donnée', W / 2, H / 2 + 4)
      return
    }

    const minP = Math.min(...allPitches) * 0.9
    const maxP = Math.max(...allPitches) * 1.1

    function toY(pitch) {
      return H - ((pitch - minP) / (maxP - minP)) * (H - 10) - 5
    }

    function drawCurve(pitches, color) {
      if (!pitches.length) return
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.beginPath()
      let first = true
      pitches.forEach((p, i) => {
        const x = (i / (pitches.length - 1 || 1)) * W
        if (p <= 0) { first = true; return }
        const y = toY(p)
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        first = false
      })
      ctx.stroke()
    }

    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, W, H)

    // grid lines
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * H
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    drawCurve(refPitches, '#8b5cf6')
    drawCurve(userPitches, '#06b6d4')
  }, [refPitches, userPitches])

  return (
    <div>
      {(refPitches.length > 0 || userPitches.length > 0) && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 6, fontSize: 12, color: 'var(--text2)' }}>
          {refPitches.length > 0 && <span style={{ color: '#8b5cf6' }}>● Modèle</span>}
          {userPitches.length > 0 && <span style={{ color: '#06b6d4' }}>● Vous</span>}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        style={{ width: '100%', height, borderRadius: 8, display: 'block' }}
      />
    </div>
  )
}
