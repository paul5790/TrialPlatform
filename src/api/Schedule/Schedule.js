import axios from "axios";

import { apiLocation } from "../index"; // apiLocation 가져오기

// Get Schedule 전체
export const getAllSchedule = async () => {
  try {
    const response = await axios.get(`http://${apiLocation}/api/schedule`, {
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
