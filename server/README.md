# M.A.R.S API server

This Express server handles item reports. It includes request logging, JSON error responses, a health endpoint, and interactive API documentation.

## Run locally

Use Node.js 20.19 or newer (the frontend uses Vite 8 as well).

```powershell
cd server
npm install
npm run dev
```

The API listens on `http://localhost:4000`. Check `http://localhost:4000/api/health` or open `http://localhost:4000/api-docs` to browse and try the endpoints. Stop the server with `Ctrl+C`.

To allow a different frontend origin, set `FRONTEND_ORIGIN` before starting the server. Comma-separated origins are supported. The default is `http://localhost:5173`.

## Routes and response format

Successful responses return their result in `data`; list responses also include pagination information in `meta`. Errors use `{ "error": { "code", "message", "details?", "requestId" } }`. Please confirm the field names and response format with the group before connecting the frontend.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check server status |
| `GET` | `/api/items` | List, search, filter, sort, paginate reports |
| `GET` | `/api/items/:id` | Get one report |
| `POST` | `/api/items` | Create a report |
| `PATCH` | `/api/items/:id` | Update allowed report fields |
| `DELETE` | `/api/items/:id` | Delete a report (reporter-only access will be added with sign-in) |

List filters: `type`, `category`, `locationId`, `status`, `q`, `from`, `to`, `sort`, `page`, and `limit`. Example: `/api/items?type=found&locationId=1&status=open&page=1&limit=20`.

An item uses the existing field names: `id`, `type`, `title`, `category`, `locationId`, `date`, `description`, `image`, `status`, `postedBy`, `color`, `brand`, `marks`, and `createdAt`. IDs and `locationId` are numeric to match the current mock records.

### Storage and sign-in

Item reports are loaded from the existing mock data into memory for local development. Changes disappear when the server restarts. Replace the in-memory repository with database calls when persistence is ready.

The create route currently accepts `postedBy` in the request body. Once sign-in is connected, take the reporter ID from the verified user token instead. Protect edits, closes, and deletes so only the person who reported an item can make those changes.

## Request and error behavior

Every response includes an `X-Request-Id` header. The logger records the request ID, method, path, status, and duration, but not query values, request bodies, cookies, or credentials. Errors never send internal stack traces to clients.
