require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const rulesRoutes = require("./routes/rules");
const reportsRoutes = require("./routes/reports");

const app = express();

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://shield-app-lovat.vercel.app",
  "https://shield-app-git-main-shield-app.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman, mobile apps, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Blocked by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Handle preflight requests
app.options("*", cors());

/* =========================
   Middleware
========================= */

app.use(express.json());

/* =========================
   Routes
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/rules", rulesRoutes);
app.use("/api/reports", reportsRoutes);

/* =========================
   Health Check
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Haya Shield API is running",
  });
});

/* =========================
   Root Route
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Haya Shield Backend Running",
  });
});

/* =========================
   404
========================= */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

/* =========================
   Database + Server Start
========================= */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB error:", err.message);
    process.exit(1);
  });
