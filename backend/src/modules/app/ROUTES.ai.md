# App module — AI / weather routes

Mounted by `routes/ai.routes.js`; all paths are under the portal prefix `/api/app`.
"Mongo" = needs `MONGO_URI` (otherwise the request errors after Mongoose's buffering timeout, as before).

| old path | new path | method | auth | backend |
|---|---|---|---|---|
| `/api/weather/farm/:farm_id` | `/api/app/weather/farm/:farm_id` | GET | cookie `token` / Bearer JWT | Postgres (farm) + Farmonaut |
| `/api/weather/get` | `/api/app/weather/get` | POST | JWT | Farmonaut (in-memory daily cache) |
| `/api/weather/public/farm/:farm_id` | `/api/app/weather/public/farm/:farm_id` | GET | none | Postgres + Farmonaut |
| `/api/weather/public/get` | `/api/app/weather/public/get` | POST | none | Farmonaut |
| `/api/weather/store-daily` | `/api/app/weather/store-daily` | POST | JWT | Mongo |
| `/api/weather/public/store-daily` | `/api/app/weather/public/store-daily` | POST | none (daily cron hook) | Mongo |
| `/api/whatsapp/analyze-crop` | `/api/app/whatsapp/analyze-crop` | POST (multipart: `image`, `body` JSON) | none | Gemini + company recommendation |
| `/api/crop-ai/analyze-crop` | `/api/app/crop-ai/analyze-crop` | POST (multipart: `image`, `body` JSON) | JWT | Gemini + Mongo (`CropDiagnosis`) + storage |
| `/api/CLSM/infer` | `/api/app/CLSM/infer` | POST | none | Mongo |
| `/api/CLSM/get-all-crops` | `/api/app/CLSM/get-all-crops` | GET | none | Mongo |
| `/api/crop-advisory` | `/api/app/crop-advisory` | GET (body `{farm_id, crop_id}`) | none | Postgres |
| `/api/indexes/:fieldId` | `/api/app/indexes/:fieldId` | POST | none | Farmonaut + Mongo |
| `/api/stress/:fieldId/:date` | `/api/app/stress/:fieldId/:date` | GET | none | Mongo |

Total: 13 routes. (`getFieldIndices` from `controllers/indexesController.js` is mounted by the core farm router, not here.)

Background job: `initAppModule()` (init.js) connects Mongo and starts the 6:00 AM daily weather cron
(`services/weatherCronService.js`: all farms -> Farmonaut -> Mongo `UserWeather`).

Env: `FARMONAUT_API_KEY`, `GEMINI_API_KEY` (both in `config/env.js`).
