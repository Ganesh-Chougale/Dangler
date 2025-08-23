import express from "express";
import cors from "cors";
import { getDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import { authenticate } from "./middleware/auth.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

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
