import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouters from "./routes/authRoutes.js";
import session from "express-session";
import { authenticate } from "./middleware/authMiddleware.js";
import noteRoutes from "./routes/noteRoutes.js";

import { db } from "./database.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: "password123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      secure: false,
    },
  }),
);

app.get("/api/test-auth", authenticate, (req, res) => {
  res.json({
    message: "Authenticated",
    userId: req.session.userId,
  });
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouters);
app.use("/api/notes", noteRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      database: "disconected",
    });
  }
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API running at port ${port}`);
});
