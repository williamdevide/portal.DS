import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

process.env.VITE_COMPUTER_NAME = os.hostname()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
