// Debug: check what the server returns to a plain fetch
const res = await fetch('https://shop.heromotocorp.com/en/collection/spare?page=1', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
  },
  redirect: 'follow',
})

console.log('Status:', res.status)
console.log('Final URL:', res.url)
console.log('Content-Type:', res.headers.get('content-type'))

const html = await res.text()
console.log('Response length:', html.length, 'chars')
console.log('\n--- First 3000 chars ---')
console.log(html.substring(0, 3000))
console.log('\n--- Product link count ---')
const matches = html.match(/\/en\/product\//g)
console.log('"/en/product/" occurrences:', matches ? matches.length : 0)
