import { apiRequest } from "../index";

// Get Boarding by Trial
export const getBoarding = async (trial) => {
  try {
    const response = await apiRequest("get", `/api/boardingmgmt/${trial}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching boarding data:", error);
    throw error;
  }
};

// Post request to add a new Personnel
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
