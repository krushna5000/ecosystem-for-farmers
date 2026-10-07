# Company portal routes

Mounted by `src/app.js` at `/api/company-portal`. All "new path" values below are relative to that prefix.
Auth = cookie `company_token` (JWT signed with `env.jwtSecret`, 7d). Missing cookie -> 401 `Unauthorized. Login first.`, bad/expired -> 403 `Invalid or expired token`.

| Old path | New path | Method | Auth |
|---|---|---|---|
| `/api/company/login` | `/company/login` | POST | public (rate limit 5 / 15 min) |
| `/api/company/update-password` | `/company/update-password` | PUT | company (rate limit 5 / 30 min) |
| `/api/company/profile` | `/company/profile` | GET | company |
| `/api/company/logout` | `/company/logout` | POST | public |
| `/api/company/brands/bulk-delete` | `/company/brands/bulk-delete` | POST | company |
| `/api/company/brands/create` | `/company/brands/create` | POST (multipart, `logo`) | company |
| `/api/company/brands/:id` | `/company/brands/:id` | PUT (multipart, `logo`) | company |
| `/api/company/brands` | `/company/brands` | GET | company |
| `/api/company/brands/table` | `/company/brands/table` | GET (`page`, `limit`) | company |
| `/api/company/brands/:id` | `/company/brands/:id` | GET | company |
| `/api/company/brands/:id` | `/company/brands/:id` | DELETE | company |
| `/api/company/categories/bulk-delete` | `/company/categories/bulk-delete` | POST | company |
| `/api/company/categories/create` | `/company/categories/create` | POST | company |
| `/api/company/categories` | `/company/categories` | GET | company |
| `/api/company/categories/table` | `/company/categories/table` | GET (`page`, `limit`) | company |
| `/api/company/categories/:id` | `/company/categories/:id` | GET | company |
| `/api/company/categories/:id` | `/company/categories/:id` | PUT | company |
| `/api/company/categories/status/:id` | `/company/categories/status/:id` | PATCH | company |
| `/api/company/categories/:id` | `/company/categories/:id` | DELETE | company |
| `/api/company/subcategories/bulk-delete` | `/company/subcategories/bulk-delete` | POST | company |
| `/api/company/subcategories` | `/company/subcategories` | POST | company |
| `/api/company/subcategories` | `/company/subcategories` | GET | company |
| `/api/company/subcategories/table` | `/company/subcategories/table` | GET (`page`, `limit`) | company |
| `/api/company/subcategories/:id` | `/company/subcategories/:id` | GET | company |
| `/api/company/subcategories/:id` | `/company/subcategories/:id` | PUT | company |
| `/api/company/subcategories/status/:id` | `/company/subcategories/status/:id` | PATCH | company |
| `/api/company/subcategories/:id` | `/company/subcategories/:id` | DELETE | company |
| `/api/company/products/bulk-delete` | `/company/products/bulk-delete` | POST | company |
| `/api/company/products` | `/company/products` | POST (multipart, `image`) | company |
| `/api/company/products` | `/company/products` | GET | company |
| `/api/company/products/table` | `/company/products/table` | GET (`page`, `limit`) | company |
| `/api/company/products/recommendation` | `/company/products/recommendation` | GET (`cropName`, `diseaseName`, `chemicalComposition`) | public |
| `/api/company/products/:id` | `/company/products/:id` | GET | company |
| `/api/company/products/:id` | `/company/products/:id` | PUT (multipart, `image`) | company |
| `/api/company/products/status/:id` | `/company/products/status/:id` | PATCH | company |
| `/api/company/products/:id` | `/company/products/:id` | DELETE | company |
| `/api/company/inventory/bulk-delete` | `/company/inventory/bulk-delete` | POST | company |
| `/api/company/inventory` | `/company/inventory` | POST | company |
| `/api/company/inventory` | `/company/inventory` | GET (`page`, `limit`) | company |
| `/api/company/inventory/:id` | `/company/inventory/:id` | GET | company |
| `/api/company/inventory/:id` | `/company/inventory/:id` | PUT | company |
| `/api/company/inventory/:id` | `/company/inventory/:id` | DELETE | company |
| `/api/crops` | `/crops` | GET (`page`, `limit`) | company |
| `/api/company/leads` | `/company/leads` | GET | company |
| `/api/company/leads/:id` | `/company/leads/:id` | PATCH | company |

Total: 45 routes. Static `/uploads/*` is served by the shared app (not part of this module).

Response envelopes are unchanged from the old backend (they differ per controller):
- brands, sub-categories, products, inventory list: `{ status: "success" | "error", message, data, pagination? }`
- categories, leads, crops, inventory (except list): `{ success, message, data | category }`
- `/table` style lists and inventory/crops lists add `pagination: { currentPage, limit, totalItems, totalPages, hasNext, hasPrev }`.
- Uploaded images are stored under folders `company/brands` and `company/products` (as before).
