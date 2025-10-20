import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const exposedEnv = {
  VITE_API_URL: JSON.stringify(process.env.VITE_API_URL),
  VITE_OTHER_KEY: JSON.stringify(process.env.VITE_OTHER_KEY)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': exposedEnv
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})
