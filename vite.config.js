import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Change 'your-repo-name' to your GitHub repository name for deployment
  base: process.env.VITE_BASE_URL || '/',
})
