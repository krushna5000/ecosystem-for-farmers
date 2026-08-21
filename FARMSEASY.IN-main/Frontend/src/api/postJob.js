import axios from "axios";
import { domain } from "../utils/domain.js";

// 🔐 Get Token From Local Storage
const getToken = () => localStorage.getItem("token");

//create job
export const postJob = async (payload) => {
  try {
    const token = getToken();
    const result = await axios.post(`${domain}/post-job`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return result; 
  } catch (error) {
    console.error("Error posting job:", error);
    throw error;
  }
};


//get all jobs
export const getJobs = async () => {
  try {
    const result = await axios.get(`${domain}/jobs`);
    return result;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};





//update
export const updateJob = async (jobId, payload) => {
  try {
    const token = getToken();
    const result = await axios.put(`${domain}/update-job/${jobId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return result;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};


//delete
export const deleteJob = async (jobId) => {
  try {
    const token = getToken();
    const result = await axios.delete(`${domain}/delete-job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return result;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

export const deleteMultipleJobs = async (ids) => {
  try {
    const token = getToken();

    const result = await axios.delete(`${domain}/jobs/bulk-delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        ids: ids, // important: DELETE uses `data` not `body`
      },
    });

    return result;
  } catch (error) {
    console.error("Error deleting multiple jobs:", error);
    throw error;
  }
};
