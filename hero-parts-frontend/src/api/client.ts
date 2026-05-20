import axios from 'axios'

// Use relative base URL so Vite's dev proxy forwards /api/* to localhost:9090.
// In production, set VITE_API_BASE_URL to the backend origin (e.g. https://api.heroparts.in).
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
      return Promise.reject(new Error('Cannot reach server. Is the backend running on port 9090?'))
    }
    const message =
      err.response?.data?.message ?? err.response?.statusText ?? err.message ?? 'Unknown error'
    return Promise.reject(new Error(message))
  }
)

export default client
