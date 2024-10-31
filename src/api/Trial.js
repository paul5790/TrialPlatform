import axios from "axios";

import { apiLocation } from "./index"; // apiLocation 가져오기

// Get Trial Type List
export const getTrial = async () => {
  try {
    const response = await axios.get(
      `http://${apiLocation}/api/trial`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
