import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias '@' to the 'src' directory
      '@components': path.resolve(__dirname, './src/components'), // Alias '@components' to 'src/components'
      '@assets': path.resolve(__dirname, './src/assets'), // Alias '@assets' to 'src/assets'
    },
  },
})
