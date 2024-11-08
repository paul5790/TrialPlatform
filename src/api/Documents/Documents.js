import { apiRequest } from "../index";

// Get all documents
export const getAllDocuments = async () => {
  try {
    const response = await apiRequest("get", "/api/document");
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

// Post a new document
export const postDocument = async (data) => {
  try {
    const response = await apiRequest("post", "/api/document", data);
    return response.data;
  } catch (error) {
    console.error("Error posting document:", error);
    throw error;
  }
};

// Update a document by ID
export const putDocument = async (idx, data) => {
  try {
    const response = await apiRequest("put", `/api/document/${idx}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

// Delete a document by ID
export const deleteDocument = async (id) => {
  try {
    const response = await apiRequest("delete", `/api/document/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};
