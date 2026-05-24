import { useState, useCallback, useRef } from 'react'
import { searchParts, expandQuery } from '../api/searchApi'
import { translateQuery } from '../utils/translation'
import type { SearchResultItem, SearchResponse } from '../types/search'

// Fetch all matching results in one shot — no pagination for search
const SEARCH_SIZE = 500

interface UseSearchState {
  results: SearchResultItem[]
  loading: boolean
  error: string | null
  wasTranslated: boolean
  translatedAs: string | null
  expandedQuery: string
  phoneticSuggestions: string[]
  totalResults: number
}

const EMPTY: UseSearchState = {
  results: [],
  loading: false,
  error: null,
  wasTranslated: false,
  translatedAs: null,
  expandedQuery: '',
  phoneticSuggestions: [],
  totalResults: 0,
}

export function useSearch() {
  const [state, setState] = useState<UseSearchState>(EMPTY)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async (
    query: string,
    categoryId?: number | null,
    model?: string | null,
    source: 'text' | 'voice' = 'text'
  ) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    if (!query.trim()) { setState(EMPTY); return }

    setState((s) => ({ ...s, loading: true, error: null }))

    const { expanded, wasTranslated, translatedAs } = translateQuery(query)
    let finalQuery         = expanded
    let finalWasTranslated = wasTranslated
    let finalTranslatedAs  = translatedAs

    if (!wasTranslated && query.trim().length >= 2) {
      // 1.5s cap — if Claude is slow/unavailable search proceeds immediately with original query
      const timeout = new Promise<string>((resolve) => setTimeout(() => resolve(query.trim()), 1500))
      const claudeResult = await Promise.race([expandQuery(query.trim()), timeout])
      if (claudeResult && claudeResult.toLowerCase() !== query.trim().toLowerCase()) {
        finalQuery         = claudeResult
        finalWasTranslated = true
        finalTranslatedAs  = claudeResult
      }
    }

    try {
      const data: SearchResponse = await searchParts({
        query: finalQuery,
        categoryId,
        model,
        page: 0,
        size: SEARCH_SIZE,
        source,
      })
      setState({
        results: data.results,
        loading: false,
        error: null,
        wasTranslated: finalWasTranslated,
        translatedAs: finalTranslatedAs,
        expandedQuery: finalQuery,
        phoneticSuggestions: data.phoneticSuggestions ?? [],
        totalResults: data.totalResults,
      })
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  return { ...state, search }
}
