import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
