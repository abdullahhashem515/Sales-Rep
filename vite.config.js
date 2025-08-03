import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx', // تأكد من تحميل ملفات .js كـ JSX
    include: /\.jsx?$/, // تطبيق JSX على ملفات .js و .jsx
  },
});