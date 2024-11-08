import axios from "axios";

import { apiLocation } from "../index"; // apiLocation 가져오기

// Get Report 전체
export const getAllReports = async () => {
  try {
    const response = await axios.get(
      `http://${apiLocation}/api/dailyreportstatus`,
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

// Post Ship
export const postDocument = async (data) => {
  try {
    const response = await axios.post(
      `http://${apiLocation}/api/dailyreportstatus`,
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

// Put Document
export const putDocument = async (idx, data) => {
  try {
    const response = await axios.put(
      `http://${apiLocation}/api/dailyreportstatus/${idx}`,
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

// Delete Document
export const deleteDocument = async (id) => {
  try {
    const response = await axios.delete(
      `http://${apiLocation}/api/dailyreportstatus/${id}`,
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
