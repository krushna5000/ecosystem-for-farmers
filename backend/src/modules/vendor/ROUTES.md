# Vendor portal routes

Mounted by `app.js` at `/api/vendor-portal`. "Vendor auth" = `authenticateVendor`: JWT (`JWT_SECRET`) from the
`vendor_access_token` cookie or `Authorization: Bearer <token>`; payload `{ id, email, role: "vendor" }` (15 min).
Refresh token (`REFRESH_SECRET`, 7 d) lives in the `vendor_refresh_token` cookie. Cookies: httpOnly, secure=false, sameSite=lax.

## Auth (`/vendor`, old `/api/vendor`)

| old path | new path | method | auth |
|---|---|---|---|
| /api/vendor/login | /api/vendor-portal/vendor/login | POST | none (loginLimiter 10 / 10 min) |
| /api/vendor/check-auth | /api/vendor-portal/vendor/check-auth | GET | vendor |
| /api/vendor/forgot-password | /api/vendor-portal/vendor/forgot-password | POST | none (forgotPasswordLimiter 5 / 15 min) |
| /api/vendor/verify-otp | /api/vendor-portal/vendor/verify-otp | POST | none |
| /api/vendor/reset-password | /api/vendor-portal/vendor/reset-password | POST | none (reset JWT in body) |
| /api/vendor/logout | /api/vendor-portal/vendor/logout | POST | none |
| /api/vendor/refresh | /api/vendor-portal/vendor/refresh | POST | refresh cookie |

## Brands (`/brands`) - multipart `logo` on create/update, stored under folder `vendor-brands`

| old path | new path | method | auth |
|---|---|---|---|
| /api/brands/bulk-delete | /api/vendor-portal/brands/bulk-delete | POST | vendor |
| /api/brands | /api/vendor-portal/brands | POST | vendor |
| /api/brands | /api/vendor-portal/brands | GET | vendor |
| /api/brands/:id | /api/vendor-portal/brands/:id | GET | vendor |
| /api/brands/:id | /api/vendor-portal/brands/:id | PUT | vendor |
| /api/brands/:id | /api/vendor-portal/brands/:id | DELETE | vendor |

## Categories (`/categories`)

| old path | new path | method | auth |
|---|---|---|---|
| /api/categories/bulk-delete | /api/vendor-portal/categories/bulk-delete | POST | vendor |
| /api/categories | /api/vendor-portal/categories | POST | vendor |
| /api/categories | /api/vendor-portal/categories | GET | vendor |
| /api/categories/:id | /api/vendor-portal/categories/:id | GET | vendor |
| /api/categories/:id | /api/vendor-portal/categories/:id | PUT | vendor |
| /api/categories/status/:id | /api/vendor-portal/categories/status/:id | PATCH | vendor |
| /api/categories/:id | /api/vendor-portal/categories/:id | DELETE | vendor |

## Sub-categories (`/subcategories`)

| old path | new path | method | auth |
|---|---|---|---|
| /api/subcategories/bulk-delete | /api/vendor-portal/subcategories/bulk-delete | POST | vendor |
| /api/subcategories | /api/vendor-portal/subcategories | POST | vendor |
| /api/subcategories | /api/vendor-portal/subcategories | GET | vendor |
| /api/subcategories/:id | /api/vendor-portal/subcategories/:id | PUT | vendor |
| /api/subcategories/status/:id | /api/vendor-portal/subcategories/status/:id | PATCH | vendor (not vendor-scoped, see below) |
| /api/subcategories/:id | /api/vendor-portal/subcategories/:id | DELETE | vendor |

(`GET /:id` was commented out in the old routes; the controller exists but is unrouted.)

## Products (`/products`) - multipart `image` on create/update, folder `vendor-products`

| old path | new path | method | auth |
|---|---|---|---|
| /api/products/bulk-delete | /api/vendor-portal/products/bulk-delete | POST | vendor |
| /api/products | /api/vendor-portal/products | POST | vendor |
| /api/products | /api/vendor-portal/products | GET | vendor |
| /api/products/brand/:brand_id | /api/vendor-portal/products/brand/:brand_id | GET | vendor |
| /api/products/category/:category_id | /api/vendor-portal/products/category/:category_id | GET | vendor |
| /api/products/subcategory/:sub_category_id | /api/vendor-portal/products/subcategory/:sub_category_id | GET | vendor |
| /api/products/:id | /api/vendor-portal/products/:id | GET | vendor |
| /api/products/:id | /api/vendor-portal/products/:id | PUT | vendor |
| /api/products/status/:id | /api/vendor-portal/products/status/:id | PATCH | vendor |
| /api/products/:id | /api/vendor-portal/products/:id | DELETE | vendor |

## Inventory (`/inventory`)

| old path | new path | method | auth |
|---|---|---|---|
| /api/inventory | /api/vendor-portal/inventory | POST | vendor |
| /api/inventory | /api/vendor-portal/inventory | GET | vendor |
| /api/inventory/:id | /api/vendor-portal/inventory/:id | GET | vendor |
| /api/inventory/:id | /api/vendor-portal/inventory/:id | PUT | vendor |
| /api/inventory/:id | /api/vendor-portal/inventory/:id | DELETE | vendor |

## Service locations (`/service-locations`)

| old path | new path | method | auth |
|---|---|---|---|
| /api/service-locations | /api/vendor-portal/service-locations | POST | vendor |
| /api/service-locations/:vendor_id | /api/vendor-portal/service-locations/:vendor_id | GET | vendor |
| /api/service-locations/location/:id | /api/vendor-portal/service-locations/location/:id | GET | vendor |
| /api/service-locations/:id | /api/vendor-portal/service-locations/:id | PUT | vendor |
| /api/service-locations/:id | /api/vendor-portal/service-locations/:id | DELETE | vendor |

## Crops (`/crops`)

| old path | new path | method | auth |
|---|---|---|---|
| /api/crops | /api/vendor-portal/crops | GET | vendor |

Total: 7 + 6 + 7 + 6 + 10 + 5 + 5 + 1 = 47 routes.

## Authorization quirks kept from the old code (security observations)

- Service locations: `POST` trusts `vendor_id` from the body; `GET /:vendor_id` returns any vendor's locations;
  `GET /location/:id`, `PUT /:id`, `DELETE /:id` are not checked against `req.vendor.id`. Any logged-in vendor can read,
  create for, edit and delete another vendor's service locations.
- `PATCH /subcategories/status/:id` looks the row up and updates it by id only (no `vendor_id` filter).
- `PUT /subcategories/:id` and `PUT /products/:id` accept `brand_id` / `category_id` / `sub_category_id` without checking they
  belong to the vendor.
- `POST /vendor/login` does not check `is_active` / `is_approve` / `is_delete`.
- `POST /vendor/forgot-password` returns the OTP in the response body ("for testing" in the old code).
