import { useState, useCallback, useEffect, useRef } from 'react'
import SearchBar from '../components/search/SearchBar'
import SearchFilters from '../components/search/SearchFilters'
import TranslationBanner from '../components/search/TranslationBanner'
import PhoneticSuggestions from '../components/search/PhoneticSuggestions'
import AiAssistantPanel from '../components/search/AiAssistantPanel'
import PartCard from '../components/parts/PartCard'
import { useSearch } from '../hooks/useSearch'
import { useAiSearch } from '../hooks/useAiSearch'
import { useCategories } from '../hooks/useCategories'
import { listParts } from '../api/partsApi'
import { logSearch } from '../api/analyticsApi'
import type { SearchResultItem } from '../types/search'

const PAGE_SIZE = 500

export default function SearchTab() {
  const [query, setQuery] = useState('')
  const [selectedModel, setSelectedModel] = useState('All Models')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [defaultParts, setDefaultParts] = useState<SearchResultItem[]>([])
  const [defaultTotal, setDefaultTotal] = useState(0)
  const [defaultTotalPages, setDefaultTotalPages] = useState(0)
  const [defaultPage, setDefaultPage] = useState(0)
  const [defaultLoading, setDefaultLoading] = useState(true)

  // Tracks whether the next debounced search was triggered by voice or text input
  const searchSourceRef = useRef<'text' | 'voice'>('text')
  // Separate ref for logging — stays 'voice' until the log actually fires,
  // so results arriving mid-flight don't reset it before the commit timer runs
  const logSourceRef = useRef<'text' | 'voice'>('text')

  const { categories } = useCategories()

  useEffect(() => {
    setDefaultLoading(true)
    listParts(defaultPage, PAGE_SIZE, selectedCategoryId, selectedModel)
      .then((page) => {
        setDefaultParts(page.content)
        setDefaultTotal(page.totalElements)
        setDefaultTotalPages(page.totalPages)
      })
      .catch(() => {})
      .finally(() => setDefaultLoading(false))
  }, [defaultPage, selectedCategoryId, selectedModel])

  const {
    results,
    loading,
    error,
    wasTranslated,
    translatedAs,
    expandedQuery,
    phoneticSuggestions,
    totalResults,
    search,
  } = useSearch()

  const { aiText, loading: aiLoading } = useAiSearch(query, selectedModel, results)

  const doSearch = useCallback(
    (q: string, catId = selectedCategoryId, model = selectedModel) => {
      const src = searchSourceRef.current
      searchSourceRef.current = 'text'   // reset for next call
      search(q, catId, model, src)
    },
    [search, selectedCategoryId, selectedModel]
  )

  // Live search — fires 300 ms after the user stops typing (or voice result arrives)
  useEffect(() => {
    const timer = setTimeout(() => { doSearch(query) }, 300)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  // Commit log — fires 1.5 s after the user stops typing, records one log entry
  useEffect(() => {
    if (!query.trim()) return
    const timer = setTimeout(() => {
      logSearch(query, expandedQuery || query, logSourceRef.current, totalResults)
      logSourceRef.current = 'text'  // reset only after the log fires
    }, 1500)
    return () => clearTimeout(timer)
  }, [query, expandedQuery, totalResults])

  function handleModelChange(m: string) {
    setSelectedModel(m)
    doSearch(query, selectedCategoryId, m)
  }

  function handleCategoryChange(id: number | null) {
    setSelectedCategoryId(id)
    doSearch(query, id, selectedModel)
  }

  function handleSuggestionClick(s: string) {
    setQuery(s)
    doSearch(s)
  }

  return (
    <div className="flex flex-col">
      {/* Sticky search controls */}
      <div className="sticky top-24 z-40 bg-white border-b border-gray-200 shadow-sm px-6 pt-3 pb-3 flex flex-col gap-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={(q) => doSearch(q)}
          onVoiceResult={(t) => {
            searchSourceRef.current = 'voice'
            logSourceRef.current = 'voice'
            setQuery(t)
          }}
        />

        <SearchFilters
          selectedModel={selectedModel}
          selectedCategoryId={selectedCategoryId}
          categories={categories}
          onModelChange={handleModelChange}
          onCategoryChange={handleCategoryChange}
        />

        {/* Pagination bar — visible only in default browse mode */}
        {!query && !defaultLoading && defaultTotalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {defaultTotal.toLocaleString('en-IN')} parts &mdash; page {defaultPage + 1} of {defaultTotalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setDefaultPage((p) => Math.max(0, p - 1))}
                disabled={defaultPage === 0}
                className="text-xs px-3 py-1 rounded border border-hero-border text-gray-600 hover:border-hero-red hover:text-hero-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setDefaultPage((p) => Math.min(defaultTotalPages - 1, p + 1))}
                disabled={defaultPage >= defaultTotalPages - 1}
                className="text-xs px-3 py-1 rounded border border-hero-border text-gray-600 hover:border-hero-red hover:text-hero-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 py-5 px-6">

      <TranslationBanner wasTranslated={wasTranslated} translatedAs={translatedAs} />
      <PhoneticSuggestions suggestions={phoneticSuggestions} onSelect={handleSuggestionClick} />
      <AiAssistantPanel text={aiText} loading={aiLoading} />

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">Searching…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          <span className="font-medium">Search error:</span> {error}
        </div>
      )}

      {!loading && query && results.length === 0 && !error && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No parts found for &quot;{query}&quot;. Try a different spelling or Hindi term.
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-xs text-gray-400">
            {totalResults} result{totalResults !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((part) => (
              <PartCard key={part.sku} part={part} matchScore={part.relevanceScore} />
            ))}
          </div>
        </>
      )}

      {/* Default all-parts view when no query is active */}
      {!query && !loading && (
        <>
          {defaultLoading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading parts…</div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {defaultParts.map((part) => (
                <PartCard key={part.sku} part={part} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
    </div>
  )
}
