import client from './client'
import type { ApiResponse } from '../types/api'
import type { SearchResultItem } from '../types/search'

export interface PartsPage {
  content: SearchResultItem[]
  totalElements: number
  totalPages: number
  number: number
}

export async function listParts(
  page = 0,
  size = 500,
  categoryId?: number | null,
  model?: string | null
): Promise<PartsPage> {
  const params: Record<string, string | number> = { page, size, sortBy: 'name' }
  if (categoryId != null) params.categoryId = categoryId
  if (model && model !== 'All Models') params.model = model
  const res = await client.get<ApiResponse<PartsPage>>('/api/v1/parts', { params })
  if (!res.data.success) throw new Error(res.data.message ?? 'Failed to load parts')
  return res.data.data
}
