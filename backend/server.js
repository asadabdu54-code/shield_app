require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const rulesRoutes = require("./routes/rules");
const reportsRoutes = require("./routes/reports");

const app = express();

// ── CORS ─────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://shield-app-lovat.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Blocked by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

// ── Routes ───────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/rules", rulesRoutes);
app.use("/api/reports", reportsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── DB + SERVER ──────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Haya Shield API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
