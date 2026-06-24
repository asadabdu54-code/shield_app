require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const rulesRoutes = require("./routes/rules");
const reportsRoutes = require("./routes/reports");

const app = express();

/* -------------------------------------------------------------------------- */
/*                                   CORS                                     */
/* -------------------------------------------------------------------------- */

const rawOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://shield-app-lovat.vercel.app",
  ...rawOrigins,
];

console.log("Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman, server-to-server requests, health checks, etc.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked Origin:", origin);

    return callback(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* -------------------------------------------------------------------------- */
/*                                Middleware                                  */
/* -------------------------------------------------------------------------- */

app.use(express.json());

/* -------------------------------------------------------------------------- */
/*                                  Routes                                    */
/* -------------------------------------------------------------------------- */

app.get("/", (req, res) => {
  res.json({
    message: "HayaShield Backend Running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    ts: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/rules", rulesRoutes);
app.use("/api/reports", reportsRoutes);

/* -------------------------------------------------------------------------- */
/*                                   404                                      */
/* -------------------------------------------------------------------------- */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

/* -------------------------------------------------------------------------- */
/*                              Error Handler                                 */
/* -------------------------------------------------------------------------- */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    error: err.message || "Server error",
  });
});

/* -------------------------------------------------------------------------- */
/*                                Database                                    */
/* -------------------------------------------------------------------------- */

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
