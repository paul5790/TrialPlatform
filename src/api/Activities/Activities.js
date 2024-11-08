// api/activity.js
import { apiRequest } from "../index";

// Get all activities
export const getAllActivities = async () => {
  try {
    const response = await apiRequest("get", "/api/activity");
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

// Post a new activity
export const postActivity = async (data) => {
  try {
    const response = await apiRequest("post", "/api/activity", data);
    return response.data;
  } catch (error) {
    console.error("Error posting activity:", error);
    throw error;
  }
};

// Update an activity
export const putActivity = async (id, data) => {
  try {
    const response = await apiRequest("put", `/api/activity/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
};

// Delete an activity
export const deleteActivity = async (id) => {
  try {
    const response = await apiRequest("delete", `/api/activity/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};
