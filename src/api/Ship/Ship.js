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

// Post Ship
export const postShip = async (data) => {
  try {
    const response = await axios.post(
      `http://${apiLocation}/api/ship`,
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

// Put Ship
export const putShip = async (id, data) => {
  try {
    const response = await axios.put(
      `http://${apiLocation}/api/ship/${id}`,
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

// Delete Ship
export const deleteShip = async (id) => {
  try {
    const response = await axios.delete(
      `http://${apiLocation}/api/ship/${id}`,
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