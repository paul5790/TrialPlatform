// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Ant Design Vue 및 스타일 임포트
import Antd from "ant-design-vue";

// Vue 앱 생성
const app = createApp(App);

// Ant Design 사용
app.use(Antd);
app.use(router);
app.mount("#app");
