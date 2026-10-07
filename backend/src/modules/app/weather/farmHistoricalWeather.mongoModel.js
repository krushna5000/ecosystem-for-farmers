import mongoose from 'mongoose';

const farmHistoricalWeatherSchema = new mongoose.Schema({
  farm_id: {
    type: Number,
    required: true,
    index: true
  },
  crop_id: {
    type: Number,
    required: true
  },
  sowing_date: {
    type: Date,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  weather_data: {
    type: Object,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'farm_historical_weather'
});

const FarmHistoricalWeather = mongoose.models.FarmHistoricalWeather || mongoose.model('FarmHistoricalWeather', farmHistoricalWeatherSchema);

export default FarmHistoricalWeather;

