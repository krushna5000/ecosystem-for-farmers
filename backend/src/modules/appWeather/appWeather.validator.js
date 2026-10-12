import { checkedBody } from "../../utils/appValidation.js";

// Messages are the legacy API texts — clients display them as-is. Each schema reports only the first
// failing rule, in the original order (see utils/appValidation.js).

export const weatherByCoordinatesSchema = checkedBody(({ latitude, longitude }) => {
  if (!latitude || !longitude) return "Latitude and longitude are required";
});

export const storeDailyWeatherSchema = checkedBody(({ user_id, farmsWithWeather }) => {
  if (!user_id || typeof user_id !== "string" || !user_id.trim()) return "Invalid user_id";
  if (!Array.isArray(farmsWithWeather)) return "Invalid payload";
});
