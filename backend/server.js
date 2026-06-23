require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const rulesRoutes = require("./routes/rules");
const reportsRoutes = require("./routes/reports");

const app = express();

// CORS — support comma-separated list in CLIENT_ORIGIN env var
const rawOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  ...rawOrigins,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server (no origin) or matching origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Blocked by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rules", rulesRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("DB error:", err.message);
    process.exit(1);
  });
