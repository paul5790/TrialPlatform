import axios from "axios";

import { apiLocation } from "./index"; // apiLocation 가져오기

// Get Trial Type List
export const getTrialType = async () => {
  try {
    const response = await axios.get(
      `http://${apiLocation}/api/trialtype/distinct-trialtype`,
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

// Post Trial Type
export const postTrialType = async (data) => {
  try {
    const response = await axios.post(
      `http://${apiLocation}/api/trialtype/add-trialtype`,
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
