// import axios from "axios";

export let apiLocation = "";

// const loadConfig = async () => {
//   try {
//     const response = await fetch("/config.json");
//     const config = await response.json();
//     apiLocation = config.apiLocation;
//   } catch (error) {
//     console.error("Error loading config:", error);
//   }
// };

// // 앱 초기화 함수
// const initializeApp = async () => {
//   await loadConfig();
//   // 여기에서 다른 초기화 작업을 수행할 수 있습니다.
// };

// // 앱이 실행될 때 초기화 함수를 호출
// initializeApp();

// api/apiHelper.js
import axios from "axios";
import { useConfigStore } from "@/store/config";

// API 요청 헬퍼 함수
export const apiRequest = async (method, url, data = null) => {
  const configStore = useConfigStore();
  await configStore.initializeConfig(); // apiLocation 초기화

  const fullUrl = `http://${configStore.apiLocation}${url}`;
  return axios({
    method,
    url: fullUrl,
    data,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
