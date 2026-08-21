import db from "../config/db.js";
import {
  addFarm as addFarmModel,
  getFarmsByUser as getFarmsByUserModel,
  getFarmById as getFarmByIdModel,
  updateFarm as updateFarmModel,
  deleteFarm as deleteFarmModel,
  addFarmCrop as addFarmCropModel,
  getFarmCropsByFarm as getFarmCropsByFarmModel,
  getFarmCropById as getFarmCropByIdModel,
  updateFarmCrop as updateFarmCropModel,
  deleteFarmCrop as deleteFarmCropModel,
  getAllActivePincodes,
  getFarmCropsByUser as getFarmCropsByUserModel,
  getAllCrops as getAllCropsModel,
  updateFarmFieldId,
} from "../models/farmModel.js";
import axios from "axios";

// Farm APIs
const addFarm = async (req, res) => {
  try {
    const { user_id, farm_name, pincode_id, farm_coordinates } = req.body;

    if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
      return res.status(400).json({
        success: false,
        message: "user_id, farm_name pincode_id and coordinates are required",
      });
    }

    if (!Array.isArray(farm_coordinates) || farm_coordinates.length < 3) {
      return res.status(400).json({
        success: false,
        message: "At least 3 boundary points required",
      });
    }

    const response = await axios.post(
      "https://us-central1-farmbase-b2f7e.cloudfunctions.net/submitField",
      {
        CropCode: "2",
        FieldName: farm_name,
        PaymentType: 1,
        SowingDate: Math.floor(Date.now() / 1000).toString(),
        Points: farm_coordinates,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FARMONAUT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const fieldId = response.data.FieldID;

    if (fieldId) {
      // await updateFarmFieldId(farm.id, fieldId);
      const data = await addFarmModel(
        user_id,
        farm_name,
        pincode_id,
        JSON.stringify(farm_coordinates),
        fieldId
      );
      res.status(201).json({
        success: true,
        message: "Farm added successfully",
        data,
      });
    } else {
      return res.status(400).json({
        success: false,
        field: "fieldId",
        message: "fieldId is required",
      });
    }
  } catch (error) {
    console.error("Error in addFarm:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    // console.log("Requested user_id:", user_id);
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const data = await getFarmsByUserModel(user_id);
    // console.log("Retrieved farms data:", data);

    res.status(200).json({
      success: true,
      message: "Farms retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmsByUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmById = async (req, res) => {
  try {
    const { farm_id } = req.params;

    if (!farm_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id is required",
      });
    }

    const data = await getFarmByIdModel(farm_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmById:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateFarm = async (req, res) => {
  try {
    const { farm_id } = req.params;
    const { farm_name, pincode_id, farm_coordinates } = req.body;

    if (!farm_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id is required",
      });
    }

    const data = await updateFarmModel(
      farm_id,
      farm_name,
      pincode_id,
      farm_coordinates
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error in updateFarm:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteFarm = async (req, res) => {
  try {
    const { farm_id } = req.params;

    if (!farm_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id is required",
      });
    }

    // Get farm details to retrieve field_id for Farmonaut API
    const farmData = await getFarmByIdModel(farm_id);

    if (!farmData) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    // Call Farmonaut API to delete the field if field_id exists
    if (farmData.field_id) {
      await axios.delete(
        `https://us-central1-farmbase-b2f7e.cloudfunctions.net/deleteField`,
        {
          data: {
              FieldID: farmData.field_id,
          },
          headers: {
            Authorization: `Bearer ${process.env.FARMONAUT_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await deleteFarmModel(farm_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteFarm:", error);
    
    // If Farmonaut API call failed, return error without deleting locally
    if (error.response || error.request) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to delete farm from Farmonaut. Local deletion aborted." 
      });
    }
    
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Farm Crop APIs
const addFarmCrop = async (req, res) => {
  try {
    const { farm_id, crop_id, sowing_date } = req.body;

    if (!farm_id || !crop_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id and crop_id are required",
      });
    }

    const firstStageId = null; // Default to null since getCropById was removed

    const data = await addFarmCropModel(farm_id, crop_id, sowing_date);

    res.status(201).json({
      success: true,
      message: "Farm crop added successfully",
      data,
    });
  } catch (error) {
    console.error("Error in addFarmCrop:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmCropsByFarm = async (req, res) => {
  try {
    const { farm_id } = req.params;

    if (!farm_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id is required",
      });
    }

    const data = await getFarmCropsByFarmModel(farm_id);

    res.status(200).json({
      success: true,
      message: "Farm crops retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmCropsByFarm:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmCropById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const data = await getFarmCropByIdModel(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm crop not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm crop retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmCropById:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateFarmCropStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_stage_id } = req.body;

    if (!id || !current_stage_id) {
      return res.status(400).json({
        success: false,
        message: "id and current_stage_id are required",
      });
    }

    const data = await updateFarmCropStageModel(id, current_stage_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm crop not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm crop stage updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error in updateFarmCropStage:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateFarmCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { sowing_date } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const data = await updateFarmCropModel(id, sowing_date);

    console.log({ data });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm crop not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm crop updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error in updateFarmCrop:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteFarmCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const data = await deleteFarmCropModel(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm crop not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Farm crop deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteFarmCrop:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllPincodes = async (req, res) => {
  try {
    const pincodes = await getAllActivePincodes();
    res.json({ success: true, pincodes });
  } catch (error) {
    console.error("Error in getAllPincodes:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmCropsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const data = await getFarmCropsByUserModel(user_id);

    res.status(200).json({
      success: true,
      message: "Farm crops retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmCropsByUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllCrops = async (req, res) => {
  try {
    const data = await getAllCropsModel();

    res.status(200).json({
      success: true,
      message: "Crops retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getAllCrops:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default {
  addFarm,
  getFarmsByUser,
  getFarmById,
  updateFarm,
  deleteFarm,
  addFarmCrop,
  getFarmCropsByFarm,
  getFarmCropById,
  updateFarmCrop,
  deleteFarmCrop,
  getAllPincodes,
  getFarmCropsByUser,
  getAllCrops,
};
