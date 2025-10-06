// frontend/vite.config.js (FINAL CORRECT VERSION)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url'; // 💡 NEW: Import from the 'url' module

// 1. Define __dirname for ESM compatibility, resolving the editor warning
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 2. CRITICAL FIX: The alias to force a single instance of React.
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
});