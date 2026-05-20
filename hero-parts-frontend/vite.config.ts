import { defineConfig } from 'vite'

export default defineConfig({
  // Vite 8 uses OXC for transforms — configure React JSX natively,
  // no @vitejs/plugin-react needed.
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
    },
  },
})
