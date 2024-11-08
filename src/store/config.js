// store/config.js
import { defineStore } from "pinia";

export const useConfigStore = defineStore("config", {
  state: () => ({
    apiLocation: "",
    isInitialized: false,
  }),
  actions: {
    async initializeConfig() {
      if (!this.isInitialized) {
        try {
          const response = await fetch("/config.json");
          const config = await response.json();
          this.apiLocation = config.apiLocation;
          this.isInitialized = true;
        } catch (error) {
          console.error("Error loading config:", error);
        }
      }
    },
  },
});
