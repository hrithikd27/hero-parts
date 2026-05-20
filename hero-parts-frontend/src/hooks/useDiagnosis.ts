import { useState } from 'react'
import { aiDiagnose, type DiagnosisLine } from '../api/claudeApi'

export function useDiagnosis() {
  const [lines, setLines] = useState<DiagnosisLine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function diagnose(symptom: string, model: string) {
    if (!symptom.trim()) return
    setLoading(true)
    setError(null)
    setLines([])
    try {
      const result = await aiDiagnose(symptom, model)
      setLines(result)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return { lines, loading, error, diagnose }
}
