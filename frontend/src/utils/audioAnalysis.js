/**
 * Détection de pitch par autocorrélation (AMDF simplifié).
 * Retourne la fréquence fondamentale en Hz, ou -1 si silence/non détecté.
 */
export function detectPitch(buffer, sampleRate) {
  const SIZE = buffer.length
  const MAX_SAMPLES = Math.floor(SIZE / 2)

  // RMS check — silence
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return -1

  let bestOffset = -1
  let bestCorr = 0
  let lastCorr = 1

  for (let offset = 1; offset < MAX_SAMPLES; offset++) {
    let corr = 0
    for (let i = 0; i < MAX_SAMPLES; i++) {
      corr += Math.abs(buffer[i] - buffer[i + offset])
    }
    corr = 1 - corr / MAX_SAMPLES
    if (corr > 0.9 && corr > lastCorr) {
      bestCorr = corr
      bestOffset = offset
    }
    lastCorr = corr
    if (lastCorr > bestCorr + 0.01) break
  }

  if (bestCorr > 0.01 && bestOffset > 0) return sampleRate / bestOffset
  return -1
}

/**
 * Calcule la similarité entre deux séries de pitch (en %).
 * Utilise une comparaison logarithmique (cents).
 */
export function computeSimilarity(refPitches, userPitches) {
  const valid = (p) => p > 0
  const ref = refPitches.filter(valid)
  const usr = userPitches.filter(valid)
  if (!ref.length || !usr.length) return 0

  const len = Math.min(ref.length, usr.length, 200)
  let totalDiff = 0
  let count = 0

  for (let i = 0; i < len; i++) {
    const ri = Math.floor(i * ref.length / len)
    const ui = Math.floor(i * usr.length / len)
    const r = ref[ri], u = usr[ui]
    if (r > 50 && u > 50) {
      // cents = 1200 * log2(ratio)
      const cents = Math.abs(1200 * Math.log2(u / r))
      totalDiff += cents
      count++
    }
  }

  if (!count) return 0
  const avgDiff = totalDiff / count
  // 0 cents = 100%, 600 cents (demi-octave) = 0%
  return Math.max(0, Math.round((1 - avgDiff / 600) * 100))
}

/**
 * Capture pitch en temps réel via Web Audio API.
 * Retourne une fonction stop().
 */
export function startPitchCapture(onPitch, bufferSize = 2048) {
  let ctx, source, processor, stream

  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    source = ctx.createMediaStreamSource(stream)
    processor = ctx.createScriptProcessor(bufferSize, 1, 1)

    processor.onaudioprocess = (e) => {
      const buf = e.inputBuffer.getChannelData(0)
      const pitch = detectPitch(buf, ctx.sampleRate)
      onPitch(pitch)
    }

    source.connect(processor)
    processor.connect(ctx.destination)
  }

  start().catch(console.error)

  return function stop() {
    try {
      processor?.disconnect()
      source?.disconnect()
      ctx?.close()
      stream?.getTracks().forEach((t) => t.stop())
    } catch (_) {}
  }
}
