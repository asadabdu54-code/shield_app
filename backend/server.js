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

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman, Render health checks, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://shield-app-lovat.vercel.app",
    ];

    // Allow localhost, production Vercel, and all Vercel preview deployments
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    console.log("Blocked Origin:", origin);

    return callback(new Error(`Blocked by CORS: ${origin}`));
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
