import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: { // This is the Vitest configuration block
    globals: true, // Makes expect, describe, test, etc. available globally
    environment: 'jsdom', // This is the test environment - a simulated DOM environment
    setupFiles: './src/setupTests.js', // This is the path to the setup file for the tests
    css: false, // This is to disable CSS processing for the tests, as it is not needed for the tests
    coverage: {
      provider: 'v8', // This is the coverage provider - v8 is the default and most common provider
      reporter: ['text', 'json', 'html'], // This is the coverage reporter - text is the default and most common reporter
    },
  },
  server: {
    proxy: {
      // Proxy API requests to the Django backend
      '/polls/api': { // This path matches the API path in my Django backend
        target: 'http://127.0.0.1:8000', // The URL of the Django backend
        changeOrigin: true, // This allows the proxy to change the origin of the request
        secure: false, // This allows the proxy to handle insecure requests
        // rewrite: (path) => path.replace(/^\/polls\/api/, ''), // This rewrites the path to remove the /polls/api prefix
      },
      // Additional proxy rules can be added here as needed
      '/admin': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
});
