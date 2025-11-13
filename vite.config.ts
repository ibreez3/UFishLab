import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@api': resolve(__dirname, 'src/api'),
      '@store': resolve(__dirname, 'src/store'),
      '@types': resolve(__dirname, 'src/types'),
      '@static': resolve(__dirname, 'src/static')
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'uni-vendor': ['@dcloudio/uni-app'],
          'ui-vendor': ['uview-plus', '@dcloudio/uni-ui']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', '@dcloudio/uni-app', 'pinia', 'uview-plus']
  }
})