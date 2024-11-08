import { apiRequest } from "../index";

// Get all reports
export const getAllReports = async () => {
  try {
    const response = await apiRequest("get", "/api/dailyreport");
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

// Get daily activity status by trial
export const getDailyActivityStatus = async (trial) => {
  try {
    const response = await apiRequest("get", `/api/activitystatus/${trial}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching activity status:", error);
    throw error;
  }
};

// Post new document
export const postDocument = async (data) => {
  try {
    const response = await apiRequest("post", "/api/dailyreport", data);
    return response.data;
  } catch (error) {
    console.error("Error posting document:", error);
    throw error;
  }
};

// Update document by ID
export const putDocument = async (idx, data) => {
  try {
    const response = await apiRequest("put", `/api/dailyreport/${idx}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

// Delete document by ID
export const deleteDocument = async (id) => {
  try {
    const response = await apiRequest("delete", `/api/dailyreport/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};
