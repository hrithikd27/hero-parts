import { useState, useCallback, useEffect, useRef } from 'react'
import TranslationBanner from '../components/search/TranslationBanner'
import PhoneticSuggestions from '../components/search/PhoneticSuggestions'
import AiAssistantPanel from '../components/search/AiAssistantPanel'
import BannerCarousel from '../components/search/BannerCarousel'
import PartCard from '../components/parts/PartCard'
import { useSearch } from '../hooks/useSearch'
import { useAiSearch } from '../hooks/useAiSearch'
import { useSearchUiStore } from '../store/searchUiStore'
import { listParts } from '../api/partsApi'
import { logSearch } from '../api/analyticsApi'
import type { SearchResultItem } from '../types/search'

const BROWSE_PAGE_SIZE = 48

export default function SearchTab() {
  const { query, selectedModel, selectedCategoryId, setQuery, consumeVoice } = useSearchUiStore()

  // Browse-mode state
  const [browseParts, setBrowseParts]             = useState<SearchResultItem[]>([])
  const [browseTotal, setBrowseTotal]             = useState(0)
  const [browsePage, setBrowsePage]               = useState(0)
  const [browseLoading, setBrowseLoading]         = useState(true)
  const [browseLoadingMore, setBrowseLoadingMore] = useState(false)
  const [browseError, setBrowseError]             = useState<string | null>(null)

  const browseTotalPages = Math.max(1, Math.ceil(browseTotal / BROWSE_PAGE_SIZE))
  const browseHasMore    = browsePage < browseTotalPages - 1

  const logSourceRef = useRef<'text' | 'voice'>('text')

  function loadBrowsePage(page: number, append = false) {
    if (append) setBrowseLoadingMore(true)
    else { setBrowseLoading(true); setBrowseError(null) }
    listParts(page, BROWSE_PAGE_SIZE, selectedCategoryId, selectedModel)
      .then((data) => {
        if (append) {
          setBrowseParts((prev) => [...prev, ...data.content])
        } else {
          setBrowseParts(data.content)
          setBrowsePage(0)
        }
        setBrowseTotal(data.totalElements)
        if (!append) setBrowsePage(page)
      })
      .catch((err: Error) => {
        if (!append) setBrowseError(err.message ?? 'Failed to load parts')
      })
      .finally(() => {
        if (append) setBrowseLoadingMore(false)
        else setBrowseLoading(false)
      })
  }

  // Initial browse load — page 0, replaces list when filters change
  useEffect(() => {
    loadBrowsePage(0)
  }, [selectedCategoryId, selectedModel])

  // Page nav — replaces parts, scrolls to top
  function handleBrowseGoToPage(page: number) {
    setBrowseLoading(true)
    setBrowseError(null)
    listParts(page, BROWSE_PAGE_SIZE, selectedCategoryId, selectedModel)
      .then((data) => { setBrowseParts(data.content); setBrowseTotal(data.totalElements); setBrowsePage(page) })
      .catch((err: Error) => { setBrowseError(err.message ?? 'Failed to load parts') })
      .finally(() => { setBrowseLoading(false); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) })
  }

  // Load More — appends next page, stays at scroll position
  function handleBrowseLoadMore() {
    loadBrowsePage(browsePage + 1, true)
  }

  const {
    results, loading, error,
    wasTranslated, translatedAs, expandedQuery,
    phoneticSuggestions, totalResults,
    search,
  } = useSearch()

  const { aiText, loading: aiLoading } = useAiSearch(query, selectedModel, results)

  const doSearch = useCallback(
    (q: string, catId = selectedCategoryId, model = selectedModel, src: 'text' | 'voice' = 'text') =>
      search(q, catId, model, src),
    [search, selectedCategoryId, selectedModel]
  )

  useEffect(() => {
    const isVoice = consumeVoice()
    if (isVoice) logSourceRef.current = 'voice'
    const timer = setTimeout(
      () => doSearch(query, selectedCategoryId, selectedModel, isVoice ? 'voice' : 'text'),
      300
    )
    return () => clearTimeout(timer)
  }, [query, selectedModel, selectedCategoryId])

  useEffect(() => {
    if (!query.trim()) return
    const timer = setTimeout(() => {
      logSearch(query, expandedQuery || query, logSourceRef.current, totalResults)
      logSourceRef.current = 'text'
    }, 1500)
    return () => clearTimeout(timer)
  }, [query, expandedQuery, totalResults])

  function handleSuggestionClick(s: string) {
    setQuery(s)
    doSearch(s, selectedCategoryId, selectedModel)
  }

  const isSearching = !!query.trim()

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F8]">

      {/* Banner — full bleed, no horizontal padding */}
      {!isSearching && <BannerCarousel />}

      <div className="flex flex-col gap-4 py-5 px-4 sm:px-6 max-w-screen-2xl w-full mx-auto">

        <TranslationBanner wasTranslated={wasTranslated} translatedAs={translatedAs} />
        <PhoneticSuggestions suggestions={phoneticSuggestions} onSelect={handleSuggestionClick} />

        {/* ── Browse: count + page nav ── */}
        {!isSearching && !browseLoading && browseTotal > 0 && (
          <div className="flex items-center justify-between -mt-1">
            <p className="text-xs text-gray-400">
              Showing{' '}
              <span className="font-semibold text-gray-600">{browseParts.length}</span>{' '}
              of{' '}
              <span className="font-semibold text-gray-600">{browseTotal.toLocaleString('en-IN')}</span>{' '}
              parts
            </p>
            <PageNav
              page={browsePage}
              totalPages={browseTotalPages}
              loading={browseLoading}
              onPrev={() => handleBrowseGoToPage(browsePage - 1)}
              onNext={() => handleBrowseGoToPage(browsePage + 1)}
              onGoTo={handleBrowseGoToPage}
            />
          </div>
        )}

        {/* ── Search: result count only (no pagination) ── */}
        {isSearching && !loading && results.length > 0 && (
          <p className="text-xs text-gray-400 -mt-1">
            <span className="font-semibold text-gray-600">{results.length}</span> results
            {totalResults > results.length && (
              <span className="text-gray-400"> (top {results.length} of {totalResults})</span>
            )}
          </p>
        )}

        <AiAssistantPanel text={aiText} loading={aiLoading} />

        {/* Search loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-hero-red rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Searching parts…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span><span className="font-medium">Error:</span> {error}</span>
          </div>
        )}

        {/* No results */}
        {!loading && isSearching && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">🔍</div>
            <p className="font-semibold text-gray-700">No parts found</p>
            <p className="text-sm text-gray-400 max-w-xs">
              No results for &ldquo;{query}&rdquo;. Try a different spelling, Hindi term, or symptom.
            </p>
          </div>
        )}

        {/* Search results — all in one viewport, no pagination */}
        {!loading && isSearching && results.length > 0 && (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 animate-fadeIn">
            {results.map((part) => (
              <PartCard key={part.sku} part={part} matchScore={part.relevanceScore} />
            ))}
          </div>
        )}

        {/* Browse error */}
        {!isSearching && browseError && !browseLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-sm text-red-500">{browseError}</p>
            <button
              onClick={() => loadBrowsePage(0)}
              className="px-6 py-2 rounded-xl border-2 border-hero-red text-hero-red text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Browse mode */}
        {!isSearching && !browseError && (
          browseLoading ? (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: BROWSE_PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 animate-fadeIn">
                {browseParts.map((part) => (
                  <PartCard key={part.sku} part={part} />
                ))}
              </div>
              {browseHasMore && (
                <LoadMoreButton onClick={handleBrowseLoadMore} loading={browseLoadingMore} />
              )}
            </>
          )
        )}

      </div>
    </div>
  )
}

// ── Page navigation with editable page input ──────────────────────────────────
function PageNav({ page, totalPages, loading, onPrev, onNext, onGoTo }: {
  page: number
  totalPages: number
  loading: boolean
  onPrev: () => void
  onNext: () => void
  onGoTo: (page: number) => void
}) {
  const [draft, setDraft] = useState(String(page + 1))

  useEffect(() => { setDraft(String(page + 1)) }, [page])

  function commit() {
    const n = parseInt(draft, 10)
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      onGoTo(n - 1)
    } else {
      setDraft(String(page + 1))
    }
  }

  const arrowBtn =
    'flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm ' +
    'text-gray-500 hover:bg-red-50 hover:border-hero-red hover:text-hero-red ' +
    'disabled:opacity-30 disabled:cursor-not-allowed transition-all'

  return (
    <div className="flex items-center gap-2">
      {/* Prev */}
      <button onClick={onPrev} disabled={page === 0 || loading} className={arrowBtn} aria-label="Previous page">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Editable page number */}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        onBlur={() => setDraft(String(page + 1))}
        className="w-11 h-8 text-center text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg outline-none focus:border-hero-red transition-colors tabular-nums shadow-sm"
      />

      {/* Static total */}
      <span className="text-sm text-gray-400 select-none">/ {totalPages}</span>

      {/* Next */}
      <button onClick={onNext} disabled={page >= totalPages - 1 || loading} className={arrowBtn} aria-label="Next page">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card">
      <div className="h-[3px] bg-gray-100 w-full" />
      <div className="bg-gray-100 animate-pulse" style={{ height: '140px' }} />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-4 w-full bg-gray-100 rounded-full animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse mt-2" />
        <div className="h-8 w-full bg-gray-100 rounded-xl animate-pulse mt-1" />
      </div>
    </div>
  )
}

function LoadMoreButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-center pt-2 pb-6">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 px-10 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-hero-red hover:text-hero-red hover:bg-red-50 disabled:opacity-50 transition-all"
      >
        {loading
          ? <><div className="w-4 h-4 border-2 border-gray-300 border-t-hero-red rounded-full animate-spin" />Loading…</>
          : 'Load More'
        }
      </button>
    </div>
  )
}
