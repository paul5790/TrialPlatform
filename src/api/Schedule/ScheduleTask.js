import { apiRequest } from "../index";

// Get Task by Trial and Version
export const getTask = async (trial, version) => {
  try {
    const response = await apiRequest(
      "get",
      `/api/schedule/activities?trialId=${trial}&version=${version}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};
