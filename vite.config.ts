import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    hmr: {
      overlay: false,
    },
    allowedHosts: ['7f356035e942.ngrok-free.app', '.ngrok-free.app'],
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  assetsInclude: [
    '**/*.JPG',
    '**/*.JPEG',
    '**/*.PNG',
    '**/*.GIF',
    '**/*.jpeg',
    '**/*.pdf',
    '**/*.PDF', // Add PDF support
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
