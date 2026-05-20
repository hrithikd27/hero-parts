import client from './client'
import type { Category } from '../types/part'
import type { ApiResponse } from '../types/api'

export async function getCategories(): Promise<Category[]> {
  const res = await client.get<ApiResponse<Category[]>>('/api/v1/categories')
  return res.data.data
}
