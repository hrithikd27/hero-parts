// Maps known speech-recognition mishearings for Indian bike-parts slang.
// Chrome en-IN often substitutes a proper noun / city that sounds similar.
// Regional language words are included so voice search works without language switching.
const CORRECTIONS: Record<string, string> = {
  // ── Hindi / Hinglish mishearings ──────────────────────────────────
  chakradarpur:  'chakradant',
  chakradar:     'chakradant',
  chakradhar:    'chakradant',
  chakradhant:   'chakradant',
  chakradarapur: 'chakradant',
  shokar:        'shocker',
  shocar:        'shocker',
  shokher:       'shocker',
  laining:       'lining',
  batari:        'batri',
  bujhi:         'bujji',
  bujhe:         'bujji',
  zanjir:        'zanjeer',
  masalah:       'masala',
  tirr:          'tyre',
  tiar:          'tyre',

  // ── Tamil / Kannada — mirror (kannadi) ────────────────────────────
  // Chrome en-IN often maps /kɐɳɳaːɖi/ → "Canada", "Kannada", "kanady"
  canada:        'kannadi',
  kanada:        'kannadi',
  kannada:       'kannadi',  // state name sounds identical to the part word
  kanady:        'kannadi',
  cannadi:       'kannadi',
  kannadiy:      'kannadi',

  // ── Telugu — mirror (addam) ───────────────────────────────────────
  adam:          'addam',
  addum:         'addam',

  // ── Bengali — mirror (ayna/aina) ──────────────────────────────────
  eyena:         'ayna',
  eine:          'ayna',
  aina:          'ayna',

  // ── Marathi — mirror (arse/arsa) ─────────────────────────────────
  aarsa:         'arsa',
  aarse:         'arsa',

  // ── Tamil — chain (sangili) ───────────────────────────────────────
  sankiliy:      'sangili',
  sangiliy:      'sangili',
  'sun gully':   'sangili',

  // ── Bengali — chain (shikal) ──────────────────────────────────────
  shikol:        'shikal',
  'she call':    'shikal',

  // ── Marathi — chain (sakhali) ─────────────────────────────────────
  saakhali:      'sakhali',
  sakhaly:       'sakhali',

  // ── Telugu — chain (golusu) ───────────────────────────────────────
  goloso:        'golusu',
  golosu:        'golusu',

  // ── Tamil/Kannada — engine oil (ennai / enne) ─────────────────────
  ennei:         'ennai',
  annie:         'ennai',

  // ── Marathi — headlight (diva) ───────────────────────────────────
  diwa:          'diva',
  deva:          'diva',

  // ── Tamil — headlight (vilakku) ──────────────────────────────────
  vilakk:        'vilakku',
  'will act':    'vilakku',

  // ── Kannada — headlight (deepa) ──────────────────────────────────
  deepa:         'deepa',  // keep correct
  dipa:          'deepa',
}

/**
 * Clean a raw voice transcript before passing to the search translation layer:
 *  - lowercase + trim
 *  - strip trailing sentence-end punctuation (., ?, !, ।, etc.)
 *  - replace known speech-recognition errors word-by-word
 */
export function correctVoiceTranscript(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[.,!?।;:।]+$/g, '')
    .trim()
    .split(/\s+/)
    .map((w) => CORRECTIONS[w] ?? w)
    .join(' ')
}
