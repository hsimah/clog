import { defineConfig, loadEnv } from "vite";
import { tsquid } from "@tsquid/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = new URL(env.CLOG_PROXY_TARGET || "http://localhost:8280")
    .origin;
  const proxy = { target, changeOrigin: true, cookieDomainRewrite: "" };
  return {
    plugins: tsquid(),
    base: "/",
    build: { manifest: true },
    server: { proxy: { "/auth": proxy, "/graphql": proxy } },
  };
});
