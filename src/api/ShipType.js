import axios from "axios";

import { apiLocation } from "./index"; // apiLocation 가져오기

// Get Ship Type List
export const getShipType = async () => {
  try {
    const response = await axios.get(
      `http://${apiLocation}/api/shiptype/distinct-shiptype`,
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

// Post Ship Type 
export const postShipType = async (data) => {
  try {
    const response = await axios.post(
      `http://${apiLocation}/api/shiptype/add-shiptype`,
      data,
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
