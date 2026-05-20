// NOTE: In production, move these calls to a Spring Boot /api/v1/ai/* endpoint
// so the API key is never exposed to the browser.
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY ?? ''
const CLAUDE_MODEL = import.meta.env.VITE_CLAUDE_MODEL ?? 'claude-sonnet-4-20250514'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
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
      max_tokens: 300,
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
