# Amazon-clone Backend (Node.js + Express)

Simple REST API to power the static Amazon clone UI. Uses file-based JSON storage for quick local development.

## Run locally

```bash
npm install
npm run dev
# Server: http://localhost:4000
```

Optional env vars:

- `PORT` (default 4000)
- `FRONTEND_ORIGIN` (default `http://localhost:5500`)
- `JWT_SECRET` (default dev secret)

## Endpoints

- Auth

  - POST `/api/auth/register` { name?, email, password }
  - POST `/api/auth/login` { email, password }
  - POST `/api/auth/logout`
  - GET `/api/auth/me`

- Catalog

  - GET `/api/products?search=&category=&page=&limit=`
  - GET `/api/products/:id`
  - GET `/api/categories`

- Cart (cookie session)

  - GET `/api/cart`
  - POST `/api/cart/items` { productId, qty?, price?, title?, image? }
  - PATCH `/api/cart/items/:productId` { qty }
  - DELETE `/api/cart/items/:productId`
  - DELETE `/api/cart`

- Orders (requires auth)
  - GET `/api/orders`
  - GET `/api/orders/:id`
  - POST `/api/orders` { items:[{productId, qty, price}], total, shippingAddress }

## Notes

- Data stored in `src/data/*.json`.
- Cookies: `sid` (session for cart), `token` (JWT for auth).
- This is a minimal backend; swap file storage for a real DB when ready.
