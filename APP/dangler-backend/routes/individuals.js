import express from "express";
import { getDB } from "../db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// --- Multer for profile image ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// --- GET all individuals ---
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [individuals] = await db.query(
      "SELECT * FROM individuals ORDER BY birth_date IS NULL, birth_date ASC"
    );
    res.json(individuals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET individual by ID (with events & tags) ---
// GET /:id → Get individual details with events + tags
router.get("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    const [individualRows] = await db.query(
      "SELECT * FROM individuals WHERE id = ?",
      [id]
    );
    if (individualRows.length === 0) {
      return res.status(404).json({ error: "Individual not found" });
    }
    const individual = individualRows[0];

    const [events] = await db.query(
      "SELECT * FROM events WHERE individual_id = ? ORDER BY event_date ASC",
      [id]
    );

    const [tags] = await db.query(
      `SELECT t.* FROM tags t
       JOIN individual_tags it ON t.id = it.tag_id
       WHERE it.individual_id = ?`,
      [id]
    );

    res.json({ individual, events, tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- POST new individual ---
router.post("/", upload.single("profile_image"), async (req, res) => {
  try {
    const db = await getDB();
    const { name, category, sub_category, description, birth_date, death_date } = req.body;
    const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      "INSERT INTO individuals (name, category, sub_category, description, birth_date, death_date, profile_image) VALUES (?,?,?,?,?,?,?)",
      [
        name,
        category,
        sub_category || null,
        description || null,
        birth_date || null,
        death_date || null,
        profile_image,
      ]
    );

    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PUT update individual ---
router.put("/:id", upload.single("profile_image"), async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const { name, category, sub_category, description, birth_date, death_date } = req.body;
    const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `UPDATE individuals 
       SET name=?, category=?, sub_category=?, description=?, birth_date=?, death_date=?, 
           profile_image = COALESCE(?, profile_image) 
       WHERE id=?`,
      [
        name,
        category,
        sub_category || null,
        description || null,
        birth_date || null,
        death_date || null,
        profile_image,
        id,
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Individual not found" });
    res.json({ message: "Individual updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE individual ---
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const [result] = await db.query("DELETE FROM individuals WHERE id=?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Individual not found" });
    res.json({ message: "Individual deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
