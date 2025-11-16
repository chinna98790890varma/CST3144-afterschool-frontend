import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Base path for GitHub Pages (if deploying to username.github.io/repo-name)
  // If deploying to username.github.io (root), use base: '/'
  // If deploying to username.github.io/repo-name, use base: '/repo-name/'
  base: process.env.NODE_ENV === 'production' ? '/CST3144-afterschool-frontend/' : '/',
})
