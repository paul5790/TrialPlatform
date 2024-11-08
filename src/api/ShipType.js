import { apiRequest } from "./index";

// Get Ship Type List
export const getShipType = async () => {
  try {
    const response = await apiRequest("get", "/api/shiptype/distinct-shiptype");
    return response.data;
  } catch (error) {
    console.error("Error fetching ship type data:", error);
    throw error;
  }
};

// Post Ship Type
export const postShipType = async (data) => {
  try {
    const response = await apiRequest(
      "post",
      "/api/shiptype/add-shiptype",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error adding ship type:", error);
    throw error;
  }
};
