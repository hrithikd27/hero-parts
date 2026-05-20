import { useState, useEffect, useRef } from 'react'
import { aiSearchAssist } from '../api/claudeApi'
import type { SearchResultItem } from '../types/search'

export function useAiSearch(
  query: string,
  model: string,
  results: SearchResultItem[]
) {
  const [aiText, setAiText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setAiText(null)

    if (!query.trim() || !import.meta.env.VITE_CLAUDE_API_KEY) return

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const partNames = results.map((r) => r.name)
        const text = await aiSearchAssist(query, model, partNames)
        setAiText(text)
      } catch {
        // Silently fail — AI is enhancement, not critical
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, model, results])

  return { aiText, loading }
}
