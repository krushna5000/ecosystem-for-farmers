import { checkedBody } from "../../utils/appValidation.js";

// Messages are the legacy API texts — clients display them as-is. Each schema reports only the first
// failing rule, in the original order (see utils/appValidation.js).

export const addFarmSchema = checkedBody(({ user_id, farm_name, pincode_id, farm_coordinates }) => {
  if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
    return "user_id, farm_name pincode_id and coordinates are required";
  }
  if (!Array.isArray(farm_coordinates) || farm_coordinates.length < 3) {
    return "At least 3 boundary points required";
  }
});

export const addFarmCropSchema = checkedBody(({ farm_id, crop_id, sowing_date }) => {
  if (!farm_id || !crop_id || !sowing_date) return "farm_id, crop_id and sowing_date are required";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sowing_date)) return "sowing_date must be in YYYY-MM-DD format";
});
