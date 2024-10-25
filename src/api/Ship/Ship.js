import axios from "axios";

import { apiLocation } from "../index"; // apiLocation 가져오기

// Get Activity 전체
export const getAllShips = async () => {
  try {
    const response = await axios.get(`http://${apiLocation}/api/ship`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
