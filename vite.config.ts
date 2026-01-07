import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // AWS S3 Configuration
        'process.env.VITE_AWS_ACCESS_KEY_ID': JSON.stringify(env.VITE_AWS_ACCESS_KEY_ID),
        'process.env.VITE_AWS_SECRET_ACCESS_KEY': JSON.stringify(env.VITE_AWS_SECRET_ACCESS_KEY),
        'process.env.VITE_AWS_REGION': JSON.stringify(env.VITE_AWS_REGION),
        'process.env.VITE_S3_BUCKET': JSON.stringify(env.VITE_S3_BUCKET),
        // Cloudinary Configuration
        'process.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.VITE_CLOUDINARY_CLOUD_NAME),
        'process.env.VITE_CLOUDINARY_API_KEY': JSON.stringify(env.VITE_CLOUDINARY_API_KEY),
        'process.env.VITE_CLOUDINARY_API_SECRET': JSON.stringify(env.VITE_CLOUDINARY_API_SECRET),
        // CDN Configuration
        'process.env.VITE_CDN_URL': JSON.stringify(env.VITE_CDN_URL),
        'process.env.VITE_CDN_VERSION': JSON.stringify(env.VITE_CDN_VERSION),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
