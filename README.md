# M.A.R.S Campus-Lost-and-Found

React + Tailwind CSS + React Router. Frontend only (mock data in `src/data/mockData.js`).

## Project topic and entities

The topic is Campus Lost & Found. The main entities are Items, Locations, Claims, and Users.

## How mock data simulates CRUD

The mock data starts in React state. Adding, editing, or deleting data changes the state while the app is running. Refreshing the page resets it to the original mock data.

## Run locally

```bash
npm install
npm run dev
```

## Routes (`src/App.jsx`)

| Path | Page | File |
|------|------|------|
| `/` | Home | `pages/Home.jsx` |
| `/items` | Item list | `pages/ItemList.jsx` |
| `/items/new` | Report an item | `pages/ReportItem.jsx` (placeholder) |
| `/items/:id` | Item details | `pages/ItemDetail.jsx` |
| `/items/:id/edit` | Edit item | `pages/EditItem.jsx` |
| `/claims/:id` | Claim details | `pages/ClaimDetail.jsx` |
| `/locations/:id` | Location details | `pages/LocationDetail.jsx` (placeholder) |
| `/login` | Login | `pages/Login.jsx` |
| `/register` | Register | `pages/Register.jsx` |
| `/dashboard` | My dashboard | `pages/Dashboard.jsx` |
| `/report` | Redirects to `/items/new` (used by Home buttons) | |
| `*` | 404 page | `pages/NotFound.jsx` |

To build a placeholder page, replace the contents of its file.

## Shared tools

- **Data:** `useData()` from `context/DataContext.jsx` (items, users, claims, locations).
- **Login state:** `useAuth()` from `context/AuthContext.jsx` gives
  `{ currentUser, login(email, password), logout(), register(form), emailExists(email) }`.
  `login` returns the user, or `null` if the email or password is wrong.
  Demo accounts are in `mockData.js` (password `password123`).
- **Theme:** `useTheme()` from `context/ThemeContext.jsx` gives `{ theme, toggleTheme }`.
  Add `dark:` classes to support dark mode.
- **Colors** (defined in `src/index.css`, based on our palette):
  `brand-50` to `brand-950` (greens, `brand-800` = #244B3C), `cream` (#F7F5EC), `line` (#DCE6D8),
  `ink` (headings), `body` (text), `muted` (#68796C), and `night-700` to `night-950` for dark mode.
  Ready-made classes: `btn-primary`, `btn-secondary`, `btn-danger`, `btn-danger-outline`,
  `card`, `form-label`, `form-input`, `form-error`, `display`, `eyebrow`, `pill`, `pill-active`.

## Deployment

`vercel.json` (Vercel) and `public/_redirects` (Netlify) send every URL to `index.html`,
so refreshing on a page like `/items/3` works.

- **Vercel:** push to GitHub, then vercel.com → Add New Project → import the repo →
  framework "Vite" (build `npm run build`, output `dist`) → Deploy.
- **Netlify:** push to GitHub, then app.netlify.com → Add new site → Import from Git →
  build command `npm run build`, publish directory `dist` → Deploy.

## Team

| Member | Name | Parts |
|--------|------|-------|
| M1 | | |
| M2 | Sara Abdo | Item List (`/items`) and Claim Details (`/claims/:id`), plus Location Details (`/locations/:id`). Mock data (`mockData.js`) and shared state (`DataContext`), reusable Modal, ItemTile card |
| M3 | Amira Hallal | Login and My Reports & Claims Dashboard |
| M4 | Mariam Abadi | Navbar (links, hamburger menu on mobile, login/logout state, theme toggle), routes in `App.jsx`, Item Details (`/items/:id`), Register (`/register`), 404 page, deployment |
