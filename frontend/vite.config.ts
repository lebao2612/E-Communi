import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'REACT_APP_'],
    server: {
      port: 3000,
      open: true,
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
        },
      },
    },
    define: {
      'process.env': {
        REACT_APP_API_URL: env.REACT_APP_API_URL || 'http://localhost:5000',
        REACT_APP_REALTIME_URL: env.REACT_APP_REALTIME_URL || env.REACT_APP_API_URL || 'http://localhost:5000',
        REACT_APP_WEBRTC_ICE_SERVERS: env.REACT_APP_WEBRTC_ICE_SERVERS || '',
      },
    },
  };
});
