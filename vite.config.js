import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from "url";
import path from "path";


export default defineConfig({
  base: "./", // 상대 경로를 사용하도록 설정
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // @를 src 디렉토리로 설정
    },
  },
  server: {
    port: 8082,
    host: "0.0.0.0", // 모든 IP에서 접근 가능하게 설정
    strictPort: true,
  },
});

