import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import stylex from 'unplugin-stylex/vite'
import relay from 'vite-plugin-relay'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = new URL(env.CLOG_PROXY_TARGET || 'http://localhost:8280').origin;
  const proxy = { target, changeOrigin: true, cookieDomainRewrite: '' };
  return {
    plugins: [stylex(), react(), relay],
    base: '/',
    build: { manifest: true },
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: {
      proxy: { '/auth': proxy, '/graphql': proxy },
    },
  };
});
