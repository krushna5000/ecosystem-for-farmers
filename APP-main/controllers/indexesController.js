import axios from "axios";
import FieldIndex from "../mongoModels/FieldIndex.model.js";
import { fetchAndStoreIndexesService } from "../services/index.service.js";
// import { Axios } from 'axios';

// Replace with your actual Farmonaut Bearer Token
const FARMONAUT_KEY = process.env.FARMONAUT_API_KEY;
const FARMONAUT_URL =
  "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getAllIndexValues";

// ===============================
// 1️⃣ JUST FETCH INDEXES (NO DB)
// ===============================
export const getFieldIndices = async (req, res) => {
  const { fieldId } = req.params;

  try {
    const response = await axios.post(
      FARMONAUT_URL,
      {
        FieldID: fieldId,
      },
      {
        headers: {
          Authorization: `Bearer ${FARMONAUT_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Farmonaut returns data mapped by date strings
    res.status(200).json({
      success: true,
      fieldId: fieldId,
      indices: response.data,
    });
    // console.log("Farmonaut response data:", response.data);
  } catch (error) {
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      success: false,
      message: "Failed to fetch data from Farmonaut",
      error: error.response?.data || error.message,
    });
  }
};

// =======================================
// 2️⃣ FETCH + MAP + STORE INDEXES (MAIN)
// =======================================
export const fetchAndStoreIndexes = async (req, res) => {
  const { fieldId } = req.params;

  try {
    const result = await fetchAndStoreIndexesService(fieldId);

    return res.status(200).json({
      success: true,
      message: "Indexes fetched & stored successfully",
      ...result,
    });
  } catch (error) {
    console.error("Farmonaut index error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch or store indexes",
      error: error.message,
    });
  }
};
