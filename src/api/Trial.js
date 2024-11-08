import { apiRequest } from "./index";

// Get Trial Type List
export const getTrial = async () => {
  try {
    const response = await apiRequest("get", "/api/trial");
    return response.data;
  } catch (error) {
    console.error("Error fetching trial data:", error);
    throw error;
  }
};
