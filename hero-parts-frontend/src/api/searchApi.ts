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
