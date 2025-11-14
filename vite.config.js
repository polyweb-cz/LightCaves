import { defineConfig } from 'vite'

export default defineConfig({
  root: './',

  test: {
    environment: 'jsdom',
    globals: true
  },

  server: {
    port: 5173,
    host: 'localhost',
    open: false,
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws'
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|gif|svg/.test(ext)) {
            return `img/[name]-[hash][extname]`
          } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          } else if (ext === 'css') {
            return `css/[name]-[hash][extname]`
          }
          return `[name]-[hash][extname]`
        }
      }
    }
  },

  publicDir: 'public',

  css: {
    devSourcemap: true
  }
})
