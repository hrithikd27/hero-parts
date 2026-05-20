/**
 * Hero MotoCorp eShop — Spare Parts Scraper (v12, no-skip)
 *
 * Bug fix from v11: a single 401 caused the batch to be silently skipped.
 * Rule now: NEVER skip a batch.  On any 401, immediately do a session
 * refresh and retry the exact same `start` value.  Only give up after
 * MAX_REFRESH_PER_BATCH session refreshes on the same start.
 *
 * Outputs: parts.json + parts.sql
 */

import { chromium } from 'playwright'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const BASE_URL   = 'https://shop.heromotocorp.com'
const OUTPUT_DIR = path.dirname(fileURLToPath(import.meta.url))

const sleep = ms => new Promise(r => setTimeout(r, ms))

function cleanItem(item, idx) {
  const alias   = item.alias || item.slug || item.url_key || null
  const sku     = (item.sku  || item.SKU  || '').trim() || null
  const price   = parseFloat(item.price)         || null
  const mrp     = parseFloat(item.compare_price) || price
  const url     = alias ? `${BASE_URL}/en/product/${alias}` : null
  const inStock = item.available !== false
  const qty     = parseInt(item.inventory_quantity) || 0
  const unit    = item.unit_count_type
    ? `${item.unit_count ?? 1} ${item.unit_count_type}`
    : '1 piece'

  return {
    id: idx + 1,
    name: (item.name || `Part-${alias || sku}`).replace(/\s+/g, ' ').trim(),
    sku, price, mrp, url, slug: alias, inStock, qty, unit,
  }
}

const BATCH_KEYS = ['data','products','result','items','results','docs']

function extractBatch(json) {
  for (const k of BATCH_KEYS) {
    if (Array.isArray(json?.[k]) && json[k].length > 0) return json[k]
  }
  return []
}

function extractTotal(json) {
  if (json?.paging?.total)  return json.paging.total
  if (json?.paging?.count)  return json.paging.count
  if (typeof json?.total === 'number' && json.total > 0) return json.total
  if (typeof json?.count === 'number' && json.count > 0) return json.count
  return null
}

async function scrapeAllParts() {
  console.log('Launching browser…')

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  })
  const bctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  })
  await bctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
  })

  const page = await bctx.newPage()

  // Mutable session state
  let capturedHeaders = null
  let baseApiUrl      = null

  /** Wire up route interception, navigate, and wait for first API call.
   *  Returns the parsed first-page JSON (or null). */
  async function refreshSession() {
    // Remove previous handler if any
    await page.unroute('**/api/1/entity/ms.products**').catch(() => {})

    let resolveFirst
    const firstDataPromise = new Promise(res => { resolveFirst = res })
    let resolved = false

    page.route('**/api/1/entity/ms.products**', async route => {
      const req = route.request()
      capturedHeaders = { ...req.headers() }
      const rawUrl = req.url()
      baseApiUrl = rawUrl
        .replace(/([?&])start=[^&]*/g, '')
        .replace(/([?&])new_search=[^&]*/g, '')
        .replace(/\?&/, '?').replace(/&&+/g, '&').replace(/[?&]$/, '')

      const response = await route.fetch()
      const body     = await response.text()
      if (!resolved) {
        resolved = true
        try { resolveFirst(JSON.parse(body)) } catch { resolveFirst(null) }
      }
      await route.fulfill({ response, body })
    })

    await page.goto(`${BASE_URL}/en/collection/spare`, { waitUntil: 'networkidle', timeout: 90_000 })
    await sleep(2000)
    return firstDataPromise
  }

  // Initial navigation
  console.log('Loading collection page…')
  const firstPageData = await refreshSession()

  if (!capturedHeaders) { await browser.close(); throw new Error('No API request intercepted.') }

  const total0 = extractTotal(firstPageData) ?? 9999
  const first0 = extractBatch(firstPageData ?? {})
  console.log(`Total: ${total0}, first batch: ${first0.length}\n`)

  const buildUrl = s => {
    const sep = baseApiUrl.includes('?') ? '&' : '?'
    return `${baseApiUrl}${sep}start=${s}&new_search=1`
  }

  /** Try to fetch one page.  Returns parsed JSON or null (on 401 / parse error). */
  async function tryFetch(start) {
    const res  = await page.request.get(buildUrl(start), { headers: capturedHeaders })
    const text = await res.text()
    if (text === 'Unauthorized' || res.status() === 401) return null
    try { return JSON.parse(text) } catch { return null }
  }

  const allItems = [...first0]
  let total      = total0
  console.log(`start=    0: ${allItems.length} / ${total}`)

  let start                 = 50
  let totalSessionRefreshes = 0
  const MAX_REFRESH_PER_BATCH = 4

  while (allItems.length < total && start < 6000) {
    await sleep(500)
    process.stdout.write(`start=${String(start).padStart(5)}: `)

    let json        = null
    let refreshes   = 0

    while (json === null && refreshes <= MAX_REFRESH_PER_BATCH) {
      json = await tryFetch(start)

      if (json === null) {
        refreshes++
        totalSessionRefreshes++
        process.stdout.write(`[401→refresh#${totalSessionRefreshes}] `)
        await refreshSession()
        await sleep(1500)
      }
    }

    if (json === null) {
      // Gave up after MAX_REFRESH_PER_BATCH — skip this batch
      console.log(`SKIP after ${refreshes} refreshes`)
      start += 50
      continue
    }

    const batch = extractBatch(json)
    if (batch.length === 0) {
      const freshTotal = extractTotal(json)
      if (freshTotal && allItems.length >= freshTotal) {
        console.log('reached end.')
        break
      }
      console.log(`empty. Done.`)
      break
    }

    allItems.push(...batch)
    const ft = extractTotal(json)
    if (ft) total = ft
    console.log(`${allItems.length} / ${total}`)
    start += 50
  }

  await browser.close()
  console.log(`\n=== Raw: ${allItems.length} | session refreshes: ${totalSessionRefreshes} ===\n`)

  // dedup
  const seenKeys = new Set()
  const cleaned  = []
  for (const item of allItems) {
    const c   = cleanItem(item, cleaned.length)
    const key = c.sku || c.slug || c.name
    if (!key || seenKeys.has(key)) continue
    seenKeys.add(key)
    cleaned.push(c)
  }
  console.log(`Unique parts: ${cleaned.length}`)

  if (cleaned.length === 0) { console.log('Nothing collected — exiting.'); return }

  // parts.json
  const jsonPath = path.join(OUTPUT_DIR, 'parts.json')
  writeFileSync(jsonPath, JSON.stringify(cleaned, null, 2), 'utf8')
  console.log(`✓ ${jsonPath}`)

  // parts.sql
  const rows = cleaned.map((p, i) => {
    const nm = (p.name || '').replace(/'/g, "''").substring(0, 499)
    const sk = (p.sku  || '').replace(/'/g, "''").substring(0, 49)
    const ur = (p.url  || '').replace(/'/g, "''").substring(0, 999)
    const sl = (p.slug || '').replace(/'/g, "''").substring(0, 299)
    const pr = p.price != null ? p.price : 'NULL'
    const mr = p.mrp   != null ? p.mrp   : pr
    const st = p.inStock ? 'TRUE' : 'FALSE'
    const qt = p.qty ?? 0
    const cm = i < cleaned.length - 1 ? ',' : ';'
    return `  ('${nm}', '${sk}', ${pr}, ${mr}, '${ur}', '${sl}', ${st}, ${qt})${cm}`
  })

  const sql = [
    `-- Hero MotoCorp eShop — ${cleaned.length} parts`,
    `-- Generated ${new Date().toISOString()}`,
    '',
    'CREATE TABLE IF NOT EXISTS scraped_parts (',
    '  id        BIGINT AUTO_INCREMENT PRIMARY KEY,',
    '  name      VARCHAR(500) NOT NULL,',
    '  sku       VARCHAR(50),',
    '  price     DECIMAL(10,2),',
    '  mrp       DECIMAL(10,2),',
    '  url       VARCHAR(1000),',
    '  slug      VARCHAR(300),',
    '  in_stock  BOOLEAN DEFAULT TRUE,',
    '  stock_qty INT DEFAULT 0',
    ');',
    '',
    'INSERT INTO scraped_parts (name, sku, price, mrp, url, slug, in_stock, stock_qty) VALUES',
    ...rows,
  ].join('\n')

  const sqlPath = path.join(OUTPUT_DIR, 'parts.sql')
  writeFileSync(sqlPath, sql, 'utf8')
  console.log(`✓ ${sqlPath}`)

  const withUrl   = cleaned.filter(p => p.url).length
  const withPrice = cleaned.filter(p => p.price).length
  const withSku   = cleaned.filter(p => p.sku).length
  console.log(`\n  With URL:   ${withUrl} / ${cleaned.length}`)
  console.log(`  With price: ${withPrice} / ${cleaned.length}`)
  console.log(`  With SKU:   ${withSku} / ${cleaned.length}`)
  console.log('\nNext:')
  console.log('  1. Run parts.sql in H2 console → http://localhost:8080/h2-console')
  console.log('  2. POST http://localhost:8080/api/v1/admin/load-scraped')
}

scrapeAllParts().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
