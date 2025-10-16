# Amazon-clone-copy-backend

Express + MongoDB backend for the Amazon clone copy.

Features included in scaffold:

- Express server with basic error handling
- Mongoose models for Product, User, Cart, Order
- Auth routes (register/login) with JWT
- Product, cart, and order routes (starter implementations)
- Seed script to populate sample products

Quick start

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:

```bash
npm install
```

3. Seed sample products (ensure MongoDB is running):

```bash
npm run seed
```

4. Start server in dev mode:

```bash
npm run dev
```

The server will run on `http://localhost:4000` by default.

## Static frontend assets

This backend can serve the existing static frontend copy so product images and CSS are available under `/static`.

Set `FRONTEND_PATH` in your `.env` to point to the parent folder that contains the `Amazon-clone - Copy` folder (default assumes the backend folder lives next to the frontend copy). Example if backend and frontend live together under `Clones`:

```
FRONTEND_PATH=..
```

Then visit `http://localhost:4000/static/index.html` to open the frontend served by the backend.

## Docker / Production

This project includes a `Dockerfile` and `docker-compose.yml` for easy local/production deployment.

Build and run with Docker Compose (creates a MongoDB service):

```bash
docker compose up --build -d
```

The backend will be reachable at `http://<host-ip>:4000`.

Notes for Google Compute (GCE) or other cloud VMs:

- Use a VM with Docker installed (or use GKE for Kubernetes).
- Transfer the repository to the VM, then run `docker compose up --build -d`.
- If you prefer an external managed MongoDB, set `MONGO_URI` to the managed instance and remove the `mongo` service from `docker-compose.yml`.

## Static frontend handling in Docker

The Dockerfile copies a frontend folder located at `../Amazon-clone - Copy` into the image at `src/frontend`. If you prefer to package the frontend differently, set the `FRONTEND_PATH` environment variable to point to the frontend folder inside the container or on the host.
