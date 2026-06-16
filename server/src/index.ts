import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Load .env from the project root
// With tsx, __dirname = server/src/, so we go up twice to reach project root
// We also try the server directory itself as a fallback
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", "..", "..", ".env") });

import { initDatabase } from "./database";
import jobsRouter from "./routes/jobs";
import coverLettersRouter from "./routes/coverLetters";
import profileRouter from "./routes/profile";

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// Middleware primer:
//
// Middleware = functions that run on EVERY request before your
// route handlers. Think of them as a security checkpoint at
// an airport — every request passes through them.
//
// cors()         → Allows the React frontend (different port)
//                  to talk to this server
// express.json() → Parses JSON request bodies so req.body works
// ============================================================

app.use(cors());
app.use(express.json());

// Mount route handlers
// Everything in jobsRouter will be prefixed with /api/jobs
app.use("/api/jobs", jobsRouter);

// Cover letters have mixed paths (/api/jobs/:id/cover-letters AND /api/cover-letters/:id)
// so we mount at /api
app.use("/api", coverLettersRouter);

app.use("/api/profile", profileRouter);

// Health check — useful for testing "is the server running?"
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialize database tables and start server
initDatabase();
console.log("Database initialized");

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
