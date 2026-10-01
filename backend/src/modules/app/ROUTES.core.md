# Farmer app — CORE routes (auth, farms, WhatsApp auth/farm)

Portal prefix: `/api/app`. Old server mounted these at `/api/<x>`; new path = `/api/app/<x>`.
Auth = `authMiddleware`: JWT from `token` cookie, else `Authorization: Bearer <jwt>` (or raw jwt); user looked up by `phone_number` claim.

| Old path | New path | Method | Auth |
|---|---|---|---|
| `/api/auth/register/send-otp` | `/api/app/auth/register/send-otp` | POST | none (detectUserType via `x-user-type`, rate limited) |
| `/api/auth/register/verify-otp` | `/api/app/auth/register/verify-otp` | POST | none (rate limited) |
| `/api/auth/login/send-otp` | `/api/app/auth/login/send-otp` | POST | none (rate limited) |
| `/api/auth/login/verify-otp` | `/api/app/auth/login/verify-otp` | POST | none (rate limited) |
| `/api/auth/logout` | `/api/app/auth/logout` | POST | none |
| `/api/auth/verify-auth` | `/api/app/auth/verify-auth` | GET | authMiddleware (cookie only inside handler) |
| `/api/auth/profile` | `/api/app/auth/profile` | GET | authMiddleware |
| `/api/auth/profile` | `/api/app/auth/profile` | PUT | authMiddleware |
| `/api/farms/add-farm` | `/api/app/farms/add-farm` | POST | authMiddleware |
| `/api/farms/get-farms/:user_id` | `/api/app/farms/get-farms/:user_id` | GET | authMiddleware |
| `/api/farms/get-farm/:farm_id` | `/api/app/farms/get-farm/:farm_id` | GET | authMiddleware |
| `/api/farms/update-farm/:farm_id` | `/api/app/farms/update-farm/:farm_id` | PUT | authMiddleware |
| `/api/farms/delete-farm/:farm_id` | `/api/app/farms/delete-farm/:farm_id` | DELETE | authMiddleware |
| `/api/farms/get-all-pincodes` | `/api/app/farms/get-all-pincodes` | GET | authMiddleware |
| `/api/farms/indices/:fieldId` | `/api/app/farms/indices/:fieldId` | GET | validateFieldRequest (no JWT); handler `getFieldIndices` owned by AI half |
| `/api/farms/get-all-crops` | `/api/app/farms/get-all-crops` | GET | authMiddleware |
| `/api/farms/add-farm-crop` | `/api/app/farms/add-farm-crop` | POST | authMiddleware |
| `/api/farms/get-farm-crops/:farm_id` | `/api/app/farms/get-farm-crops/:farm_id` | GET | authMiddleware |
| `/api/farms/get-farm-crops-by-user/:user_id` | `/api/app/farms/get-farm-crops-by-user/:user_id` | GET | authMiddleware |
| `/api/farms/get-farm-crop/:id` | `/api/app/farms/get-farm-crop/:id` | GET | authMiddleware |
| `/api/farms/update-farm-crop/:id` | `/api/app/farms/update-farm-crop/:id` | PUT | authMiddleware |
| `/api/farms/delete-farm-crop/:id` | `/api/app/farms/delete-farm-crop/:id` | DELETE | authMiddleware |
| `/api/farms/pincode-boundary/:pincode` | `/api/app/farms/pincode-boundary/:pincode` | GET | authMiddleware |
| `/api/whatsapp-auth/check-user` | `/api/app/whatsapp-auth/check-user` | POST | none |
| `/api/whatsapp-auth/register` | `/api/app/whatsapp-auth/register` | POST | none |
| `/api/whatsapp-farm/add-farm` | `/api/app/whatsapp-farm/add-farm` | POST | none |

Total: 26 routes (8 auth, 15 farms incl. the `indices` route, 2 whatsapp-auth, 1 whatsapp-farm).
