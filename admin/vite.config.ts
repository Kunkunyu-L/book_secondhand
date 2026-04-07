import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5175,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/admin": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/home": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // 注意：前端路由里也包含 `chat-...`，如果代理配置成 `/chat` 会误代理页面刷新
      // 这里仅代理后端真正的聊天 REST 接口，避免命中 `/chat-sessions-manage` 等前端路由
      "/chat/messages": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/chat/sessions": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/chat/session": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
