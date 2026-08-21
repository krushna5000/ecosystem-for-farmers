export function extractDailyTemperatures(weatherDocs, farm_id) {
  const temps = [];

  weatherDocs.forEach((doc) => {
    const farm = doc.farmsWithWeather?.find((f) => f.id === Number(farm_id));

    if (!farm) return;

    const daily = farm?.weather?.daily?.[0];

    if (!daily?.temp?.max || !daily?.temp?.min) return;

    temps.push({
      date: doc.created_at,
      avg_temperature: Number(
        ((daily.temp.max + daily.temp.min) / 2 - 273.15).toFixed(2)
      ),
    });
  });

  return temps;
}
