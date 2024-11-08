import { apiRequest } from "../index";

// Get all Personnel
export const getAllPersonnel = async () => {
  try {
    const response = await apiRequest("get", "/api/personnel");
    return response.data;
  } catch (error) {
    console.error("Error fetching personnel data:", error);
    throw error;
  }
};

// Add new Personnel
export const postPersonnel = async (data) => {
  try {
    const response = await apiRequest("post", "/api/personnel", data);
    return response.data;
  } catch (error) {
    console.error("Error adding personnel:", error);
    throw error;
  }
};

// Update Personnel by ID
export const putPersonnel = async (id, data) => {
  try {
    const response = await apiRequest("put", `/api/personnel/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating personnel:", error);
    throw error;
  }
};

// Delete Personnel by ID
export const deletePersonnel = async (id) => {
  try {
    const response = await apiRequest("delete", `/api/personnel/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting personnel:", error);
    throw error;
  }
};
