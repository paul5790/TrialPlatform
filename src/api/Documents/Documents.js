import axios from "axios";

import { apiLocation } from "../index"; // apiLocation 가져오기

// Get Activity 전체
export const getAllDocuments = async () => {
  try {
    const response = await axios.get(`http://${apiLocation}/api/document`, {
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
export const postDocument = async (data) => {
  try {
    const response = await axios.post(`http://${apiLocation}/api/document`, data, {
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

// Put Document
export const putDocument = async (idx, data) => {
  try {
    const response = await axios.put(
      `http://${apiLocation}/api/document/${idx}`,
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
      `http://${apiLocation}/api/document/${id}`,
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
