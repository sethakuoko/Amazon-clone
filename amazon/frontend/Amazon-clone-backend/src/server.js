import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import api from "./routes/index.js";
import { sessionCookie } from "./middleware/session.js";
import rateLimit from "express-rate-limit";

const app = express();

// Basic middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS - allow the static frontend origin (adjust as needed)
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5500";
app.use(cors({ origin: allowedOrigin, credentials: true }));

// Logging
app.use(morgan("dev"));
app.use(sessionCookie());

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "amazon-clone-backend" });
});

// API routes
app.use("/api", api);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
