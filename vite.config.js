import { defineConfig } from 'vite'

export default defineConfig({
  // Change 'aves-xr-gallery' to your actual GitHub repo name for Pages deployment
  // base: '/aves-xr-gallery/',
  base: './',
  publicDir: 'public',
  server: {
    host: true,
    port: 5173,
    // Proper MIME types for 3D model files
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'model-viewer': ['@google/model-viewer'],
        },
      },
    },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.usdz'],
})

