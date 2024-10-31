import axios from "axios";

import { apiLocation } from "../index";  // apiLocation 가져오기

// Get Personnel 전체
export const getAllPersonnel = async () => {
  try {
    const response = await axios.get(`http://${apiLocation}/api/personnel`, {
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

// Post 요청으로 새로운 Personnel 추가
export const postPersonnel = async (data) => {
  try {
    const response = await axios.post(
      `http://${apiLocation}/api/personnel`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding personnel:", error);
    throw error;
  }
};

// Put Personnel
export const putPersonnel = async (id, data) => {
  try {
    const response = await axios.put(
      `http://${apiLocation}/api/personnel/${id}`,
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

// Delete Personnel
export const deletePersonnel = async (id) => {
  try {
    const response = await axios.delete(
      `http://${apiLocation}/api/personnel/${id}`,
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