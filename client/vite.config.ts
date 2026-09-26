import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import stylex from 'unplugin-stylex/vite'
import relay from 'vite-plugin-relay'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = new URL(env.WP_PROXY_TARGET || env.VITE_GRAPHQL_URL || '/', 'http://localhost:8080').origin;
  const proxy = { target, changeOrigin: true, cookieDomainRewrite: '' };
  return {
    plugins: [stylex(), react(), relay],
    base: mode === 'production' ? './' : '/clog',
    build: { manifest: true },
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: {
      proxy: { '/graphql': proxy, '/wp-admin': proxy, '/wp-login.php': proxy, '/wp-includes': proxy },
    },
  };
});
