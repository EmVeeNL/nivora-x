import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const devServerPort = parseInt(env['VITE_PORT'] ?? '5173', 10)
  const devServerOrigin = env['VITE_ORIGIN'] ?? `http://localhost:${devServerPort}`

  return {
    plugins: [tailwindcss(), react()],

    root: resolve(__dirname, 'app'),

    resolve: {
      alias: {
        '@': resolve(__dirname, 'app'),
      },
    },

    build: {
      outDir:   resolve(__dirname, 'plugin/build'),
      emptyOutDir: true,
      manifest: true,
      rollupOptions: {
        input: resolve(__dirname, 'app/main.tsx'),
      },
    },

    server: {
      port:   devServerPort,
      origin: devServerOrigin,
      // Allow cross-origin requests from WordPress (served on a different port).
      cors: true,
      hmr:  { protocol: 'ws', host: 'localhost', port: devServerPort },
    },
  }
})
