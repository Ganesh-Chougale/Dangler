import express from "express";
import cors from "cors";
import { getDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import { authenticate } from "./middleware/auth.js";
import individualsRoutes from "./routes/individuals.js";
import eventsRoutes from "./routes/events.js";
import tagsRoutes from "./routes/tags.js";
import tagRoutes from "./routes/tags.js";
import tagModerationRoutes from "./routes/tagModeration.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/individuals", individualsRoutes);
app.use("/api/events", eventsRoutes);
// app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/tags", tagsRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/tag-moderation", tagModerationRoutes);

// DB test route
app.get("/test-db", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT NOW() AS now");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route (JWT required)
app.get("/protected", authenticate, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, this is protected` });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));