/**
 * Calcule le "relief vocal" d'une série de pitch.
 * Retourne { label, score (0-100) }
 */
export function computeVocalRelief(pitchData) {
  if (!pitchData || pitchData.length < 5) return { label: 'Faible', score: 0 }

  const valid = pitchData.filter((p) => p > 0)
  const total = pitchData.length
  if (valid.length < 3) return { label: 'Faible', score: 0 }

  // 1. Changements de direction mélodique
  let dirChanges = 0
  for (let i = 1; i < valid.length - 1; i++) {
    const d1 = valid[i] - valid[i - 1]
    const d2 = valid[i + 1] - valid[i]
    if (d1 * d2 < 0) dirChanges++
  }
  const dirScore = Math.min(dirChanges / Math.max(valid.length * 0.25, 1), 1)

  // 2. Étendue de pitch (range)
  const min = Math.min(...valid)
  const max = Math.max(...valid)
  const rangeScore = Math.min((max - min) / 250, 1)

  // 3. Présence de silences (variété rythmique)
  const silenceRatio = (total - valid.length) / total
  const silenceScore = silenceRatio > 0.05 && silenceRatio < 0.5 ? 1 : 0.2

  // 4. Variété des intervalles
  const intervals = []
  for (let i = 1; i < valid.length; i++) {
    intervals.push(Math.abs(valid[i] - valid[i - 1]))
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const intervalScore = Math.min(avgInterval / 80, 1)

  const score = Math.round(
    (dirScore * 0.35 + rangeScore * 0.35 + silenceScore * 0.15 + intervalScore * 0.15) * 100
  )

  let label
  if (score < 25) label = 'Faible'
  else if (score < 50) label = 'Moyen'
  else if (score < 75) label = 'Riche'
  else label = 'Très riche'

  return { label, score }
}

/**
 * Génère un commentaire textuel simple à partir des scores.
 */
export function generateComment({ score_relief, score_similarity, score_rhythm, score_monotony, score_intensity }) {
  const tips = []

  if (score_relief != null) {
    if (score_relief < 30) tips.push('Ton relief vocal est plat — varie les durées et laisse des silences.')
    else if (score_relief > 70) tips.push('Beau relief vocal !')
  }
  if (score_similarity != null) {
    if (score_similarity < 30) tips.push('La phrase est encore éloignée du modèle — imprègne-toi d\'abord en boucle.')
    else if (score_similarity > 75) tips.push('Excellente similarité avec le modèle !')
  }
  if (score_rhythm != null && score_rhythm < 35) {
    tips.push('Le rythme manque de précision — écoute les attaques du modèle.')
  }
  if (score_monotony != null && score_monotony > 65) {
    tips.push('La phrase est trop régulière — exagère les contrastes.')
  }
  if (score_intensity != null && score_intensity < 35) {
    tips.push('Accentue davantage les moments forts.')
  }

  return tips.length ? tips.join(' ') : 'Bonne session !'
}

/**
 * Banques de syllabes pour le scat.
 */
export const SYLLABLE_BANKS = {
  doux:       ['doo', 'loo', 'mm', 'wa', 'laa', 'noo', 'lee', 'mwa'],
  percussif:  ['ba', 'da', 'dap', 'bop', 'dat', 'ka', 'tch', 'bap'],
  sensuel:    ['mm', 'ya', 'waa', 'laa', 'doo', 'ohh', 'hmm', 'naa'],
  jazz:       ['bop', 'shoo', 'doo-bap', 'dat', 'skee', 'boo-dah', 'sha-bam'],
}

/**
 * Génère une ligne de scat aléatoire à partir d'un style.
 */
export function generateScatLine(style = 'doux', count = 6) {
  const bank = SYLLABLE_BANKS[style] || SYLLABLE_BANKS.doux
  const line = []
  for (let i = 0; i < count; i++) {
    line.push(bank[Math.floor(Math.random() * bank.length)])
  }
  return line
}
