import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { transformWithEsbuild } from 'vite'
import restart from 'vite-plugin-restart'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/',
  publicDir: '../public/',
  plugins: [
    // Restart server on static/public file change
    restart({ restart: [ '../public/**', ] }),

    // React support
    react(),

    // .js file support as if it was JSX
    {
      name: 'load+transform-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/))
          return null

        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
  ],
  // Add a custom cache location to avoid permission issues
  cacheDir: path.resolve(__dirname, 'node_modules/.vite_cache'),
  // Alternatively, disable caching if issues persist
  // optimizeDeps: {
  //   disabled: true
  // },
  server: {
    host: true, // Open to local network and display URL
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env), // Open if it's not a CodeSandbox
    // Prevent watch errors
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  build: {
    outDir: '../dist', // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
})