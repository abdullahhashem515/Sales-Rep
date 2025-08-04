import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  esbuild: {
    loader: 'jsx', // تأكد من تحميل ملفات .js كـ JSX
    include: /\.jsx?$/, // تطبيق JSX على ملفات .js و .jsx
  },
});