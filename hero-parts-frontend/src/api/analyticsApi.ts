import client from './client'
import { getSessionId } from '../utils/session'

export function trackEshopClick(partSku: string, partName: string, eshopUrl: string): void {
  client.post('/api/v1/analytics/eshop-click', {
    partSku,
    partName,
    eshopUrl,
    sessionId: getSessionId(),
  }).catch(() => {})
}

/** Called after the user has been idle 1.5 s — logs one committed search entry. */
export function logSearch(
  rawQuery: string,
  translatedQuery: string,
  source: 'text' | 'voice',
  resultsCount: number
): void {
  if (!rawQuery.trim()) return
  client.post('/api/v1/analytics/search-event', {
    rawQuery,
    translatedQuery,
    source,
    resultsCount: String(resultsCount),
    sessionId: getSessionId(),
  }).catch(() => {})
}
