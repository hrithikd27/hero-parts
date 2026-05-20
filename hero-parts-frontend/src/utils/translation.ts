import { ATTR_DICT } from '../constants/attrDict'
import { SLANG_DICT } from '../constants/slangDict'

export interface TranslationResult {
  expanded: string
  wasTranslated: boolean
  translatedAs: string | null
}

function applyAttrDict(query: string): { result: string; changed: boolean } {
  const words = query.toLowerCase().split(/\s+/)
  let changed = false
  const out: string[] = []
  let i = 0
  while (i < words.length) {
    // Try 3-word then 2-word then 1-word
    let matched = false
    for (let len = Math.min(3, words.length - i); len >= 1; len--) {
      const phrase = words.slice(i, i + len).join(' ')
      if (ATTR_DICT[phrase]) {
        out.push(ATTR_DICT[phrase])
        i += len
        changed = true
        matched = true
        break
      }
    }
    if (!matched) {
      out.push(words[i])
      i++
    }
  }
  return { result: out.join(' '), changed }
}

function applySlangDict(query: string): { injected: string[]; changed: boolean } {
  const lower = query.toLowerCase()
  const injected: string[] = []

  // Multi-word phrases first (up to 5 words)
  const words = lower.split(/\s+/)
  for (let len = Math.min(5, words.length); len >= 1; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ')
      if (SLANG_DICT[phrase] && !injected.includes(SLANG_DICT[phrase])) {
        injected.push(SLANG_DICT[phrase])
      }
    }
  }

  return { injected, changed: injected.length > 0 }
}

export function translateQuery(raw: string): TranslationResult {
  const lower = raw.toLowerCase().trim()
  const { result: attrResult, changed: attrChanged } = applyAttrDict(lower)
  const { injected, changed: slangChanged } = applySlangDict(lower)

  // Use the translated form instead of appending to the original.
  // Attr dict does inline word replacement (e.g. "safed" → "white"),
  // slang dict replaces known slang with its English equivalent.
  const terms = new Set<string>()

  if (slangChanged) {
    injected.forEach((t) => terms.add(t))
  } else {
    terms.add(attrChanged ? attrResult : lower)
  }

  const expanded = Array.from(terms).join(' ')
  const wasTranslated = attrChanged || slangChanged

  return {
    expanded,
    wasTranslated,
    translatedAs: wasTranslated ? expanded : null,
  }
}
