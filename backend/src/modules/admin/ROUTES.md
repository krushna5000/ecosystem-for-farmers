# Admin portal routes

Mounted by `src/app.js` at `/api/admin`. The old server mounted everything under `/api`.
Auth = `adminAuth` middleware (JWT in the `adminToken` cookie, signed with the per-portal secret `JWT_SECRET:admin`, payload `{ id, email }`, 1 day).

| Old path | New path | Method | Auth |
|---|---|---|---|
| `/api/login` | `/api/admin/login` | POST | public |
| `/api/logout` | `/api/admin/logout` | POST | admin |
| `/api/dashboard` | `/api/admin/dashboard` | GET | admin |
| `/api/check-auth` | `/api/admin/check-auth` | GET | admin |
| `/api/companies/add-company` (multipart, field `logo`) | `/api/admin/companies/add-company` | POST | admin |
| `/api/companies` (`?page&limit` optional) | `/api/admin/companies` | GET | admin |
| `/api/companies/:id` | `/api/admin/companies/:id` | GET | admin |
| `/api/companies/:id` (multipart, field `logo`) | `/api/admin/companies/:id` | PUT | admin |
| `/api/companies/:id` | `/api/admin/companies/:id` | DELETE | admin |
| `/api/companies/bulk-delete` | `/api/admin/companies/bulk-delete` | POST | admin |
| `/api/companies/:id/toggle-active` | `/api/admin/companies/:id/toggle-active` | PATCH | admin |
| `/api/companies/otp/send` | `/api/admin/companies/otp/send` | POST | public |
| `/api/companies/otp/verify` | `/api/admin/companies/otp/verify` | POST | public |
| `/api/companies/company/verify-email/:token` | `/api/admin/companies/company/verify-email/:token` | GET | public |
| `/api/companies/company/reset-password/:token` | `/api/admin/companies/company/reset-password/:token` | POST | public |
| `/api/company-otp/otp/send` | `/api/admin/company-otp/otp/send` | POST | public |
| `/api/company-otp/otp/verify` | `/api/admin/company-otp/otp/verify` | POST | public |
| `/api/company-types` | `/api/admin/company-types` | POST | public (as before) |
| `/api/company-types` (`?page&limit` optional) | `/api/admin/company-types` | GET | public (as before) |
| `/api/company-types/:id` | `/api/admin/company-types/:id` | PUT | public (as before) |
| `/api/company-types/:id` | `/api/admin/company-types/:id` | DELETE | public (as before) |
| `/api/vendors` (multipart PDFs: `shop_act_pdf`, `gst_pdf`, `licence_pdf`, `pan_pdf`) | `/api/admin/vendors` | POST | admin |
| `/api/vendors` (`?page&limit` optional) | `/api/admin/vendors` | GET | admin |
| `/api/vendors/:id` (multipart PDFs) | `/api/admin/vendors/:id` | PUT | admin |
| `/api/vendors/:id` | `/api/admin/vendors/:id` | DELETE | admin |
| `/api/vendors/bulk-delete` | `/api/admin/vendors/bulk-delete` | POST | admin |
| `/api/vendors/:id/toggle-active` | `/api/admin/vendors/:id/toggle-active` | PATCH | admin |
| `/api/vendors/verify-email/:token` | `/api/admin/vendors/verify-email/:token` | GET | public |
| `/api/vendors/reset-password/:token` | `/api/admin/vendors/reset-password/:token` | POST | public |
| `/api/vendors/otp/send` | `/api/admin/vendors/otp/send` | POST | public |
| `/api/vendors/otp/verify` | `/api/admin/vendors/otp/verify` | POST | public |
| `/api/vendor-otp/vendors/otp/send` | `/api/admin/vendor-otp/vendors/otp/send` | POST | public |
| `/api/vendor-otp/vendors/otp/verify` | `/api/admin/vendor-otp/vendors/otp/verify` | POST | public |

33 routes. The OTP routes exist twice for companies (`/companies/otp/*`, `/company-otp/otp/*`) and for vendors (`/vendors/otp/*`, `/vendor-otp/vendors/otp/*`); both are kept because both were reachable before.

Uploads: company logo -> `uploads/companies/` (jpg/jpeg/png, 2MB); vendor PDFs -> `vendors/<timestamp>-<field>.pdf` (PDF only, 10MB). Upload/filter errors now return JSON 400 `{ success:false, message }`.
