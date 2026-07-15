import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_COMPUTER_NAME': JSON.stringify(os.hostname())
  }
})
