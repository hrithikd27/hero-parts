import client from './client'
import type { SearchRequest, SearchResponse } from '../types/search'
import type { ApiResponse } from '../types/api'
import { getSessionId } from '../utils/session'

export async function searchParts(req: SearchRequest): Promise<SearchResponse> {
  const params: Record<string, string | number | boolean> = {
    q: req.query,
    page: req.page ?? 0,
    size: req.size ?? 20,
    sessionId: getSessionId(),
  }
  if (req.categoryId != null) params.categoryId = req.categoryId
  if (req.inStockOnly) params.inStockOnly = true
  if (req.source) params.source = req.source
  if (req.model && req.model !== 'All Models') params.model = req.model

  const res = await client.get<ApiResponse<SearchResponse>>('/api/v1/search', { params })

  if (!res.data.success) {
    throw new Error(res.data.message ?? 'Search failed')
  }

  return res.data.data
}

/** Calls the backend Claude proxy to map any slang/Hindi query to a canonical English part name. */
export async function expandQuery(q: string): Promise<string> {
  try {
    const res = await client.get<ApiResponse<string>>('/api/v1/search/expand', { params: { q } })
    return res.data.data ?? q
  } catch {
    return q
  }
}

export interface ImageSearchResult {
  identifiedAs: string
  suggestions: string[]
  results: import('../types/search').SearchResultItem[]
  totalResults: number
}

export async function searchByImage(file: File): Promise<ImageSearchResult> {
  const form = new FormData()
  form.append('image', file)
  const res = await client.post<ApiResponse<ImageSearchResult>>(
    '/api/v1/search/by-image',
    form,
    { headers: { 'Content-Type': undefined }, timeout: 30_000 }
  )
  if (!res.data.success) throw new Error(res.data.message ?? 'Image search failed')
  return res.data.data
}

export async function getSuggestions(q: string): Promise<string[]> {
  if (q.trim().length < 2) return []
  try {
    const res = await client.get<ApiResponse<string[]>>('/api/v1/search/suggest', {
      params: { q },
    })
    return res.data.data ?? []
  } catch {
    return []
  }
}
