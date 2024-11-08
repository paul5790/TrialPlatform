import { apiRequest } from "./index";

// Get Trial Type List
export const getTrialType = async () => {
  try {
    const response = await apiRequest(
      "get",
      "/api/trialtype/distinct-trialtype"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching trial type data:", error);
    throw error;
  }
};

// Post Trial Type
export const postTrialType = async (data) => {
  try {
    const response = await apiRequest(
      "post",
      "/api/trialtype/add-trialtype",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error adding trial type data:", error);
    throw error;
  }
};
