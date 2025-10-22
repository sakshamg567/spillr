import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
    }),
    tailwindcss()
  ],

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ],
    exclude: ['framer-motion'] 
  },

  build: {
    sourcemap: false,

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, 
        drop_debugger: true,
      },
    },

    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          
          'router': ['react-router-dom'],
 
          'ui-icons': ['lucide-react', 'react-icons'],

          'animations': ['framer-motion'],
        },
        
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    chunkSizeWarningLimit: 1000,
 
    cssCodeSplit: true,
  },

  server: {
    https: false,
    
    hmr: {
      overlay: false,
    },
  },


  preview: {
    port: 4173,
    strictPort: false,
  },
})