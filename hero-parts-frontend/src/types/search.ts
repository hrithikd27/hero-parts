// Matches SearchResponse.java + SearchResponse.SearchResultItem exactly
export interface SearchResultItem {
  sku: string
  name: string
  hindiName: string | null
  description: string | null
  categoryName: string
  price: number
  mrp: number
  unit: string
  compatibleModels: string | null
  eshopUrl: string | null
  imageUrl: string | null
  inStock: boolean | null
  stockQty: number | null
  matchedAlias: string | null
  matchedAliasType: string | null
  relevanceScore: number
}

export interface SearchResponse {
  query: string
  matchType: string
  totalResults: number
  page: number
  size: number
  results: SearchResultItem[]
  // These fields are derived client-side; backend does not return them
  phoneticSuggestions?: string[]
}

export interface SearchRequest {
  query: string
  categoryId?: number | null
  model?: string | null
  inStockOnly?: boolean
  page?: number
  size?: number
  source?: 'text' | 'voice'
}

export type MatchConfidence = 'strong' | 'sounds-like' | 'weak'

export function matchConfidence(score: number): MatchConfidence {
  if (score >= 8) return 'strong'
  if (score >= 3) return 'sounds-like'
  return 'weak'
}
