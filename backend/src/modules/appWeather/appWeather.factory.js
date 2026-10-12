// Pure DB I/O (MongoDB) for weather snapshots. No business rules, no req/res.
import { UserWeather, Weather } from "./appWeather.schema.js";

/** One record per user per day: create it or replace the farms' weather in it. */
export function upsertUserWeatherInDB(userId, createdAt, farmsWithWeather) {
  return UserWeather.findOneAndUpdate(
    { user_id: userId, created_at: createdAt },
    {
      user_id: userId,
      created_at: createdAt,
      farmsWithWeather,
    },
    {
      upsert: true,
      new: true,
    },
  );
}

/** A user's daily snapshots with `from <= created_at <= to` (YYYY-MM-DD), oldest first. */
export function listUserWeatherInRangeInDB(userId, from, to) {
  return Weather.find({
    user_id: userId,
    created_at: { $gte: from, $lte: to },
  }).sort({ created_at: 1 });
}
