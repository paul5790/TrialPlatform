import axios from "axios";

import { apiLocation } from "../index";  // apiLocation 가져오기

// Get Activity 전체
export const getAllActivities = async () => {
  try {
    const response = await axios.get(`http://${apiLocation}/api/activity`, {
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

// Post Activity
export const postActivity = async (data) => {
  try {
    const response = await axios.post(
      `http://${apiLocation}/api/activity`,
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

// Put Activity
export const putActivity = async (id, data) => {
  try {
    const response = await axios.put(
      `http://${apiLocation}/api/activity/${id}`,
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

// Delete Activity
export const deleteActivity = async (id) => {
  try {
    const response = await axios.delete(
      `http://${apiLocation}/api/activity/${id}`,
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