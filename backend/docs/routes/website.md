# Website module (farmseasy.in marketing site CMS)

Mounted by `src/app.js` at `/api/website`. Old server mounted everything under `/api`
(jobs/admin/connections directly, `/api/blogs`, `/api/team`); the leading `/api` is dropped.

Auth = JWT in the `website_admin_token` cookie (httpOnly, sameSite=lax, secure=false, 7d), verified by
`middleware/auth.js` with `env.jwtSecret`. As in the old backend, ONLY `GET /login` is protected.

| Old path | New path | Method | Auth |
|---|---|---|---|
| `/api/login` | `/api/website/login` | POST | public |
| `/api/logout` | `/api/website/logout` | POST | public |
| `/api/registeradmin` | `/api/website/registeradmin` | POST | public (UNPROTECTED) |
| `/api/login` | `/api/website/login` | GET | website_admin_token cookie (session check) |
| `/api/jobs` | `/api/website/jobs` | GET | public |
| `/api/post-job` | `/api/website/post-job` | POST | public (UNPROTECTED) |
| `/api/update-job/:id` | `/api/website/update-job/:id` | PUT | public (UNPROTECTED) |
| `/api/delete-job/:id` | `/api/website/delete-job/:id` | DELETE | public (UNPROTECTED) |
| `/api/jobs/bulk-delete` | `/api/website/jobs/bulk-delete` | DELETE | public (UNPROTECTED) |
| `/api/connections` | `/api/website/connections` | POST | public (contact form) |
| `/api/connections` | `/api/website/connections` | GET | public (UNPROTECTED, leaks PII) |
| `/api/connections/:id` | `/api/website/connections/:id` | GET | public (UNPROTECTED, leaks PII) |
| `/api/connections/:id` | `/api/website/connections/:id` | PUT | public (UNPROTECTED) |
| `/api/connections/:id` | `/api/website/connections/:id` | DELETE | public (UNPROTECTED) |
| `/api/connections/bulk-delete` | `/api/website/connections/bulk-delete` | DELETE | public (UNPROTECTED) |
| `/api/blogs` | `/api/website/blogs` | POST (multipart: `images` x10, `video` x1) | public (UNPROTECTED) |
| `/api/blogs` | `/api/website/blogs` | GET | public |
| `/api/blogs/:id` | `/api/website/blogs/:id` | GET | public |
| `/api/blogs/:id` | `/api/website/blogs/:id` | PUT (multipart: `images` x10, `video` x1, `tags[]`) | public (UNPROTECTED) |
| `/api/blogs/:id` | `/api/website/blogs/:id` | DELETE | public (UNPROTECTED) |
| `/api/blogs/bulk-delete` | `/api/website/blogs/bulk-delete` | DELETE | public (UNPROTECTED) |
| `/api/team` | `/api/website/team` | POST (multipart: `image`) | public (UNPROTECTED) |
| `/api/team` | `/api/website/team` | GET | public |
| `/api/team/:emp_id` | `/api/website/team/:emp_id` | GET | public |
| `/api/team/:emp_id` | `/api/website/team/:emp_id` | PUT (multipart: `image`) | public (UNPROTECTED) |
| `/api/team/:emp_id` | `/api/website/team/:emp_id` | DELETE | public (UNPROTECTED) |
| `/api/team/bulk-delete` | `/api/website/team/bulk-delete` | DELETE | public (UNPROTECTED) |

26 routes. Uploads: memory storage, 50MB per file, no mime filter (as before); stored via
`uploadFile` in folders `blogs/images`, `blogs/videos`, `team/images`.

Not ported (never routed in the old code): `getAdminProfile`, `updateAdmin`, `deleteAdmin`
(adminController) and `updateBlogImages` (blogController).
