import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
    server: {
    allowedHosts: [
      'chancily-sericate-cari.ngrok-free.dev', // Allows requests from my-app.com
    ]
  }
})

