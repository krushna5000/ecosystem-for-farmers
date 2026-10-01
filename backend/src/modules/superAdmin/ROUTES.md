# Super Admin portal routes

Mounted by `src/app.js` at `/api/super-admin`. Old server base: `http://host:5000` with the `/api/...` mounts below.

Auth column:
- **cookie** = `authMiddleware` (JWT in the `token` cookie, signed with `JWT_SECRET`, payload `{ id }`, 30 days). 401 `Unauthorized - No token provided` / `Invalid or expired token`.
- **public** = no auth. `login` is rate limited to 5 requests / 15 min (429 `Too many login attempts. Try again later.`).

Only `authMiddleware` is mounted anywhere. The old `middlewares/auth.js` (`superAdminAuth`, Bearer token + `role === "superadmin"`) was never used by any route; it is kept (unified in `middleware/auth.js`, exported, unmounted). `createAdminLimiter` (3 / 10 min) was likewise defined but never mounted in the original, and still is not.

## Auth + admins (old mount `/api`)

| Old path | New path | Method | Auth |
|---|---|---|---|
| `/api/superadmin/login` | `/api/super-admin/superadmin/login` | POST | public (loginLimiter) |
| `/api/superadmin/logout` | `/api/super-admin/superadmin/logout` | POST | cookie |
| `/api/superadmin/check-auth` | `/api/super-admin/superadmin/check-auth` | GET | cookie |
| `/api/admin` | `/api/super-admin/admin` | POST | cookie |
| `/api/admin` | `/api/super-admin/admin` | GET | cookie |
| `/api/admin/:id` | `/api/super-admin/admin/:id` | PUT | cookie |
| `/api/admin/:id` | `/api/super-admin/admin/:id` | DELETE | cookie |
| `/api/admin/password/:id` | `/api/super-admin/admin/password/:id` | PUT | cookie |
| `/api/bulk-delete` | `/api/super-admin/bulk-delete` | DELETE | cookie |

## Crop categories (old mount `/api/crop-categories`)

| Old path | New path | Method | Auth |
|---|---|---|---|
| `/api/crop-categories` | `/api/super-admin/crop-categories` | POST | cookie |
| `/api/crop-categories` | `/api/super-admin/crop-categories` | GET | cookie |
| `/api/crop-categories/bulk-delete` | `/api/super-admin/crop-categories/bulk-delete` | DELETE | cookie |
| `/api/crop-categories/:id` | `/api/super-admin/crop-categories/:id` | GET | cookie |
| `/api/crop-categories/:id` | `/api/super-admin/crop-categories/:id` | PUT | cookie |
| `/api/crop-categories/:id` | `/api/super-admin/crop-categories/:id` | DELETE | cookie |

## Crop stages (old mount `/api/crop-stages`)

| Old path | New path | Method | Auth |
|---|---|---|---|
| `/api/crop-stages` | `/api/super-admin/crop-stages` | POST | cookie |
| `/api/crop-stages` | `/api/super-admin/crop-stages` | GET | cookie |
| `/api/crop-stages/bulk-delete` | `/api/super-admin/crop-stages/bulk-delete` | DELETE | cookie |
| `/api/crop-stages/:id` | `/api/super-admin/crop-stages/:id` | GET | cookie |
| `/api/crop-stages/:id` | `/api/super-admin/crop-stages/:id` | PUT | cookie |
| `/api/crop-stages/:id` | `/api/super-admin/crop-stages/:id` | DELETE | cookie |

## Crops (old mount `/api/crops`)

| Old path | New path | Method | Auth |
|---|---|---|---|
| `/api/crops/add` | `/api/super-admin/crops/add` | POST | cookie |
| `/api/crops/all` | `/api/super-admin/crops/all` | GET | cookie |
| `/api/crops/bulk-delete` | `/api/super-admin/crops/bulk-delete` | DELETE | cookie |
| `/api/crops/update/:id` | `/api/super-admin/crops/update/:id` | PUT | cookie |
| `/api/crops/delete/:id` | `/api/super-admin/crops/delete/:id` | DELETE | cookie |

## Location (old mount `/api/location`; all cookie auth)

Old base `/api/location` becomes `/api/super-admin/location`. Same method + suffix:

| Suffix | Methods |
|---|---|
| `/states` | POST, GET |
| `/states/bulk-delete` | DELETE |
| `/states/:id` | GET, PUT, DELETE |
| `/districts` | POST, GET |
| `/districts/bulk-delete` | DELETE |
| `/districts/:id` | GET, PUT, DELETE |
| `/districts/:id/toggle-active` | PUT |
| `/cities` | POST, GET |
| `/cities/bulk-delete` | DELETE |
| `/cities/:id` | GET, PUT, DELETE |
| `/cities/:id/toggle-active` | PUT |
| `/villages` | POST, GET |
| `/villages/bulk-delete` | DELETE |
| `/villages/:id` | GET, PUT, DELETE |
| `/villages/:id/toggle-active` | PUT |
| `/pincode` | POST (note: singular, as in the original) |
| `/pincodes` | GET |
| `/pincodes/bulk-delete` | DELETE |
| `/pincodes/:id` | GET, PUT, DELETE |
| `/pincodes/:id/toggle-active` | PUT |
| `/hierarchy` | GET |

Total: 9 + 6 + 6 + 5 + 35 = 61 routes (method + path pairs).
