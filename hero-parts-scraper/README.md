# Hero Parts Scraper

Playwright-based scraper for all 5230+ spare parts at `shop.heromotocorp.com/en/collection/spare`.

## Output

| File | Contents |
|------|----------|
| `parts.json` | Array of `{id, name, price, priceRaw, url, slug, priceConfirmed}` |
| `parts.sql` | `CREATE TABLE scraped_parts` + bulk `INSERT` statements |

## Setup & Run

```bash
npm install
npx playwright install chromium   # one-time: downloads ~150 MB
npm run scrape
```

Runtime: ~20–40 minutes for 5230 parts (clicking "Load More" ~105 times).

## Import into Backend

**Step 1** — Run `parts.sql` against the database:
```
# H2 console at http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:heropartsdb
# Run the contents of parts.sql
```

**Step 2** — Call the loader endpoint:
```bash
curl -X POST http://localhost:8080/api/v1/admin/load-scraped
```

Response:
```json
{ "success": true, "data": { "inserted": 5187, "skipped": 43 } }
```

**Step 3** — Re-categorise parts via the Parts API or directly in the DB.  
All scraped parts land in the first available category by default.

## Price Confidence

| `priceConfirmed` | Meaning |
|---|---|
| `true` | From a `/en/product/` page — exact price |
| `false` | From the collection listing — indicative only |

The frontend shows `~Rs.X` for indicative prices automatically.
