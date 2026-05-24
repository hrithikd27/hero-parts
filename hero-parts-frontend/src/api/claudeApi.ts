// NOTE: In production, move these calls to a Spring Boot /api/v1/ai/* endpoint
// so the API key is never exposed to the browser.
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY ?? ''
const CLAUDE_MODEL = import.meta.env.VITE_CLAUDE_MODEL ?? 'claude-sonnet-4-20250514'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(systemPrompt: string, userMessage: string, maxTokens = 300): Promise<string> {
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Claude API error: ${res.status}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

export async function aiSearchAssist(
  query: string,
  model: string,
  foundParts: string[]
): Promise<string> {
  const system =
    'You are a Hero MotoCorp spare parts expert. ' +
    'Identify the part from the possibly misspelled or slang query, ' +
    'mention 1-2 related parts if relevant. Reply in max 2 sentences. Be concise.'

  const user = `Query: "${query}" | Vehicle: ${model}. Parts found: ${foundParts.slice(0, 5).join(', ') || 'none'}`
  return callClaude(system, user)
}

export interface DiagnosisLine {
  partName: string
  reason: string
}

export async function aiDiagnose(symptom: string, model: string): Promise<DiagnosisLine[]> {
  const system =
    'You are a Hero MotoCorp bike diagnostic expert. ' +
    'Given a symptom, list up to 4 likely faulty parts in order of likelihood. ' +
    'Format each line exactly as: Part Name | Why it could be the cause. ' +
    'No extra text outside the list.'

  const user = `Symptom: "${symptom}" | Vehicle: ${model}`
  const raw = await callClaude(system, user)

  return raw
    .split('\n')
    .filter((l) => l.includes('|'))
    .map((line) => {
      const [partName, reason] = line.split('|').map((s) => s.trim())
      return { partName: partName ?? '', reason: reason ?? '' }
    })
    .filter((d) => d.partName.length > 0)
}

/**
 * Expands any search query — typed or spoken — into the canonical English part
 * name it most likely refers to, using Claude's understanding of Indian
 * automotive slang, Hindi/regional vocabulary, symptom descriptions, and
 * phonetic misspellings.
 *
 * Called for ALL searches when the static dictionaries don't recognise the term,
 * so both text and voice benefit from semantic understanding.
 * Falls back to the original query if Claude fails — never throws.
 */
export async function expandSearchQuery(query: string): Promise<string> {
  const system = `You are a spare-parts assistant at a Hero MotoCorp workshop in India.
A mechanic has typed or spoken a search query. It may be Hindi, Hinglish, Marathi, Punjabi,
or broken English — possibly a slang term, phonetic misspelling, symptom phrase, or brand name.
Map it to the best-matching canonical English search term from the AVAILABLE PARTS list below.

AVAILABLE PARTS — canonical term | known aliases / slang / symptoms:
- spark plug       | masala, masale, bujji, NGK, denso, sparking nahi, miss fire, misfire
- engine oil       | tel, mobil, servo, castrol, tabbdil, 10w30, motor oil
- battery          | batri, amaron, exide, self start nahi, battery down, charging nahi
- shock absorber   | shocker, shockar, shokr, rear shocker, jhakka aata hai
- front fork       | front suspension, agla kanta, fork assembly, kanta
- fork oil seal    | fork seal, tel seal fork, fork leak, aage se tel tapakna
- headlight bulb   | batti, head light, light nahi jal rahi, batti nahi
- indicator bulb   | indicator batti, blinker, dikhavni batti, indicator nahi
- CDI unit         | cdi box, ignition module, start nahi hona
- carburettor      | carbi, carburator, carbrate, mileage kharab, petrol nahi aa raha
- clutch plate     | fiber, fibre, gear nahi lag raha, clutch slip, clutch phisalta hai, ghissi plate
- clutch cable     | clutch taar, cluch cable, clutch wire
- drive chain      | zanjeer, patta, chakri, chakradant, tara, chein, 428 chain, chain kit
- brake cable      | brake wire rear, pichla brake taar, brake taar
- tyre             | tire, pahiya, paiya, pehiya, chakka, tiar, tirr, aage ka tyre, pichla tyre
- inner tube       | tube, agla tube, pichla tube, front tube, rear tube, ander ki nali
- mudguard         | fender, mudgard, aage ka mudgard, front mudguard, rear mudguard, mud guard
- saree guard      | ladies guard, leg guard, sari guard, dupatta guard, mahila guard
- side panel       | side cover, sayd panel, body panel
- fuel tank cap    | tank cap, petrol tank dhakkan, fuel cap, dhakkan
- fuel petcock     | petcock, petrol cock, tap, fuel valve, petrol band karne wala, petrol nali
- camshaft         | cam shaft, kamshaft, valve timing, engine shaft

COLOUR WORDS — translate in-place and keep with the part name:
laal/lal=red, safed=white, kala/kaala=black, neela=blue, peela=yellow, hara=green

POSITION WORDS — translate in-place:
aage/agla=front, peeche/pichla=rear, baaya=left, daaya=right

INSTRUCTIONS:
- Return ONLY the canonical English search term — 1 to 5 words, no explanation, no punctuation, no quotes.
- Always pick the closest AVAILABLE PART. Never invent a part not on the list.
- If the query describes a symptom, return the most likely faulty part name.
- If the query is already clear English matching the list, return it unchanged (lowercase).`

  const raw = await callClaude(system, `Query: "${query}"`, 40)
  const cleaned = raw.replace(/^["'`]+|["'`]+$/g, '').trim()
  return cleaned || query
}
