import axios from "axios";

export let apiLocation = "";

const loadConfig = async () => {
  try {
    const response = await fetch("/config.json");
    const config = await response.json();
    apiLocation = config.apiLocation;
  } catch (error) {
    console.error("Error loading config:", error);
  }
};

// 앱이 실행될 때 config를 로드
await loadConfig();