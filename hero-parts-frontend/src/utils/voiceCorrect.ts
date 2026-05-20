// Maps known speech-recognition mishearings for Indian bike-parts slang.
// Chrome often substitutes an Indian city/proper-noun that sounds similar.
// Add entries here as new misrecognitions are discovered.
const CORRECTIONS: Record<string, string> = {
  // sprocket family
  chakradarpur:  'chakradant',
  chakradar:     'chakradant',
  chakradhar:    'chakradant',
  chakradhant:   'chakradant',
  chakradarapur: 'chakradant',

  // common mishearings
  shokar:  'shocker',
  shocar:  'shocker',
  shokher: 'shocker',
  laining: 'lining',
  batari:  'batri',
  batri:   'batri',   // already correct, keep for safety
  bujhi:   'bujji',
  bujhe:   'bujji',
  patta:   'patta',   // keep correct
  zanjir:  'zanjeer',
  zanjeer: 'zanjeer',
  masalah: 'masala',
  masale:  'masale',
  tirr:    'tyre',
  tiar:    'tyre',
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
