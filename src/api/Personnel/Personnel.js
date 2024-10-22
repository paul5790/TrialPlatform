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
export const addPersonnel = async (personnelData) => {
  try {
    const response = await axios.post(
      `http://${apiLocation}/api/personnel`,
      personnelData,
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