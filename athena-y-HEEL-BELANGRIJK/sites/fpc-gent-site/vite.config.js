import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

export default defineConfig(async ({ command }) => {
  const isDev = command === 'serve';
  let athenaEditorPlugin = null;

  if (isDev) {
    const pluginPath = path.resolve(__dirname, '../../factory/5-engine/lib/vite-plugin-athena-editor.js');
    if (fs.existsSync(pluginPath)) {
      try {
        const mod = await import(`file://${pluginPath}`);
        athenaEditorPlugin = mod.default;
      } catch (e) {
        console.warn("⚠️ Athena Editor plugin kon niet worden geladen:", e.message);
      }
    }
  }

  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      athenaEditorPlugin ? athenaEditorPlugin() : null
    ].filter(Boolean),
    server: {
      host: true,
      port: 3000,
      strictPort: false,
      cors: true
    }
  };
});