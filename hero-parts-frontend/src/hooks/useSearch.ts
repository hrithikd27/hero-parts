import { useState, useCallback, useRef } from 'react'
import { searchParts } from '../api/searchApi'
import { translateQuery } from '../utils/translation'
import type { SearchResultItem, SearchResponse } from '../types/search'

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

  const search = useCallback(
    async (
      query: string,
      categoryId?: number | null,
      model?: string | null,
      source: 'text' | 'voice' = 'text'
    ) => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      if (!query.trim()) {
        setState(EMPTY)
        return
      }

      setState((s) => ({ ...s, loading: true, error: null }))

      const { expanded, wasTranslated, translatedAs } = translateQuery(query)

      try {
        const data: SearchResponse = await searchParts({
          query: expanded,
          categoryId,
          model,
          page: 0,
          size: 40,
          source,
        })

        setState({
          results: data.results,
          loading: false,
          error: null,
          wasTranslated,
          translatedAs,
          expandedQuery: expanded,
          phoneticSuggestions: data.phoneticSuggestions ?? [],
          totalResults: data.totalResults,
        })
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return
        setState((s) => ({
          ...s,
          loading: false,
          error: (err as Error).message,
        }))
      }
    },
    []
  )

  return { ...state, search }
}
