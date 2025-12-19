// import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  base: '/sword-and-supper-item-relations/',
  plugins: [
    tailwindcss(),
    tsConfigPaths(),
  ]
});