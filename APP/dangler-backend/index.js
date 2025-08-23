import express from "express";
import cors from "cors";
import { getDB } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/test-db", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT NOW() AS now");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

