import { apiRequest } from "../index";

// Get all Schedules
export const getAllSchedule = async () => {
  try {
    const response = await apiRequest("get", "/api/schedule");
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule data:", error);
    throw error;
  }
};
