import { useState } from 'react'
import { generateScatLine, SYLLABLE_BANKS } from '../utils/vocalRelief'

const STYLES = Object.keys(SYLLABLE_BANKS)
const STYLE_LABELS = { doux: 'Doux', percussif: 'Percussif', sensuel: 'Sensuel', jazz: 'Jazz' }

/**
 * props:
 *   onLine(syllables: string[]) — quand une nouvelle ligne est générée
 *   onStyleChange(style)
 */
export default function ScatSyllableGenerator({ onLine, onStyleChange }) {
  const [style, setStyle] = useState('doux')
  const [line, setLine] = useState([])

  function generate() {
    const l = generateScatLine(style, 6)
    setLine(l)
    onLine?.(l)
  }

  function changeStyle(s) {
    setStyle(s)
    onStyleChange?.(s)
    const l = generateScatLine(s, 6)
    setLine(l)
    onLine?.(l)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Style selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => changeStyle(s)}
            className="btn"
            style={{
              flex: 1,
              padding: '10px 6px',
              fontSize: 12,
              background: style === s ? 'var(--accent)' : 'var(--surface2)',
              color: style === s ? '#fff' : 'var(--text2)',
              borderRadius: 8,
            }}
          >
            {STYLE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Generated line */}
      {line.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
            padding: '20px 12px',
            background: 'var(--surface2)',
            borderRadius: 12,
            minHeight: 80,
          }}
        >
          {line.map((syl, i) => (
            <span
              key={i}
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: i % 2 === 0 ? 'var(--accent)' : 'var(--text)',
                letterSpacing: 1,
              }}
            >
              {syl}
            </span>
          ))}
        </div>
      )}

      <button className="btn btn-primary btn-full" onClick={generate}>
        ✨ Nouvelle ligne
      </button>
    </div>
  )
}
