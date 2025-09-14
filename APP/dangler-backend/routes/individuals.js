import express from "express";
import { getDB } from "../db.js";
import multer from "multer";
import path from "path";
import { authenticate } from "../middleware/auth.js";
const router = express.Router();

// --- Multer for profile image ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"), false);
    }
    cb(null, true);
  },
});

// Helper function to extract and convert the numeric year from the formatted date string
function getNumericYear(dateString) {
  if (!dateString) return null;
  // Assumes YYYY-MM-DD or similar format
  const parts = dateString.split('-');
  let year = parseInt(parts[0], 10);
  return year;
}

// --- GET all individuals ---
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [individuals] = await db.query(
      "SELECT * FROM individuals ORDER BY birth_year_numeric IS NULL, birth_year_numeric ASC"
    );
    res.json(individuals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET individual by ID (with events & tags) ---
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
      "SELECT * FROM events WHERE individual_id = ? ORDER BY event_year_numeric ASC, event_date ASC",
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

    const birth_year_numeric = birth_date ? getNumericYear(birth_date) : null;
    const death_year_numeric = death_date ? getNumericYear(death_date) : null;

    const [result] = await db.query(
      "INSERT INTO individuals (name, category, sub_category, description, birth_date, birth_year_numeric, death_date, death_year_numeric, profile_image) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        name,
        category,
        sub_category || null,
        description || null,
        birth_date || null,
        birth_year_numeric,
        death_date || null,
        death_year_numeric,
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

    const birth_year_numeric = birth_date ? getNumericYear(birth_date) : null;
    const death_year_numeric = death_date ? getNumericYear(death_date) : null;

    const [result] = await db.query(
      `UPDATE individuals
       SET name=?, category=?, sub_category=?, description=?, birth_date=?, birth_year_numeric=?, death_date=?, death_year_numeric=?,
           profile_image = COALESCE(?, profile_image)
       WHERE id=?`,
      [
        name,
        category,
        sub_category || null,
        description || null,
        birth_date || null,
        birth_year_numeric,
        death_date || null,
        death_year_numeric,
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

/* -----------------------------
    🔥 TAG RELATION ENDPOINTS
--------------------------------*/
// Attach a tag to individual
router.post("/:id/tags", authenticate, async (req, res) => {
  const { id } = req.params;
  const { tagId } = req.body;
  try {
    const db = await getDB();
    await db.query(
      "INSERT INTO individual_tags (individual_id, tag_id) VALUES (?, ?)",
      [id, tagId]
    );
    res.json({ message: "Tag attached successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Tag already attached" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Remove a tag from individual
router.delete("/:id/tags/:tagId", authenticate, async (req, res) => {
  const { id, tagId } = req.params;
  try {
    const db = await getDB();
    const [result] = await db.query(
      "DELETE FROM individual_tags WHERE individual_id=? AND tag_id=?",
      [id, tagId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Tag relation not found" });
    res.json({ message: "Tag detached successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tags for an individual (clean endpoint)
router.get("/:id/tags", async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDB();
    const [rows] = await db.query(
      `SELECT t.* FROM tags t
       JOIN individual_tags it ON t.id = it.tag_id
       WHERE it.individual_id = ?`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;