// api/ship.js
import { apiRequest } from "../index";

// Get all ships
export const getAllShips = async () => {
  try {
    const response = await apiRequest("get", "/api/ship");
    return response.data;
  } catch (error) {
    console.error("Error fetching ships:", error);
    throw error;
  }
};

// Post a new ship
export const postShip = async (data) => {
  try {
    const response = await apiRequest("post", "/api/ship", data);
    return response.data;
  } catch (error) {
    console.error("Error posting ship:", error);
    throw error;
  }
};

// Update a ship
export const putShip = async (id, data) => {
  try {
    const response = await apiRequest("put", `/api/ship/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating ship:", error);
    throw error;
  }
};

// Delete a ship
export const deleteShip = async (id) => {
  try {
    const response = await apiRequest("delete", `/api/ship/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting ship:", error);
    throw error;
  }
};
