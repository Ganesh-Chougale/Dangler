// routes/individuals.js
import express from "express";
import multer from "multer";
import path from "path";
import { getDB } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

/* -----------------------------
    🔹 Multer for profile image
-------------------------------*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // ⚠ make sure folder exists
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("Only image files allowed (jpg, png, gif)"));
  },
});

/* -----------------------------
    🔹 Helpers
-------------------------------*/
function getNumericYear(dateString) {
  if (!dateString) return null;
  return parseInt(dateString.split("-")[0], 10);
}

/* -----------------------------
    🔹 Validation rules
-------------------------------*/
const individualValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("birth_date").optional().isDate({ format: "YYYY-MM-DD" }).withMessage("Invalid birth_date"),
  body("death_date").optional().isDate({ format: "YYYY-MM-DD" }).withMessage("Invalid death_date"),
];

/* -----------------------------
    🔹 CRUD: Individuals
-------------------------------*/

// GET all individuals
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

// GET individual by ID (with events & tags)
router.get("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const [individualRows] = await db.query("SELECT * FROM individuals WHERE id=?", [id]);
    if (!individualRows.length) return res.status(404).json({ error: "Individual not found" });

    const [events] = await db.query(
      "SELECT * FROM events WHERE individual_id=? ORDER BY event_year_numeric ASC, event_date ASC",
      [id]
    );

    const [tags] = await db.query(
      `SELECT t.* FROM tags t
       JOIN individual_tags it ON t.id = it.tag_id
       WHERE it.individual_id=?`,
      [id]
    );

    res.json({ individual: individualRows[0], events, tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new individual
router.post("/", upload.single("profileImage"), individualValidation, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const db = await getDB();
    const { name, description, category } = req.body;
    const profilePath = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      "INSERT INTO individuals (name, description, category, profile_image) VALUES (?, ?, ?, ?)",
      [name, description || "", category, profilePath]
    );

    const [rows] = await db.query("SELECT * FROM individuals WHERE id=?", [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT update individual
router.put("/:id", upload.single("profileImage"), individualValidation, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const db = await getDB();
    const { id } = req.params;
    const { name, category, sub_category, description, birth_date, death_date } = req.body;
    const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

    const birth_year_numeric = getNumericYear(birth_date);
    const death_year_numeric = getNumericYear(death_date);

    const [result] = await db.query(
      `UPDATE individuals
       SET name=?, category=?, sub_category=?, description=?, birth_date=?, birth_year_numeric=?, death_date=?, death_year_numeric=?,
           profile_image = COALESCE(?, profile_image)
       WHERE id=?`,
      [name, category, sub_category || null, description || null, birth_date || null, birth_year_numeric,
        death_date || null, death_year_numeric, profile_image, id]
    );

    if (!result.affectedRows) return res.status(404).json({ error: "Individual not found" });

    const [rows] = await db.query("SELECT * FROM individuals WHERE id=?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE individual
router.delete("/:id", async (req, res, next) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM individuals WHERE id=?", [id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Individual not found" });
    res.json({ message: "Individual deleted successfully" });
  } catch (err) {
    next(err);
  }
});

/* -----------------------------
    🔹 TAG RELATIONS
-------------------------------*/

// Attach a tag
router.post("/:id/tags", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { tagId } = req.body;
  try {
    const db = await getDB();
    await db.query("INSERT INTO individual_tags (individual_id, tag_id) VALUES (?, ?)", [id, tagId]);
    res.json({ message: "Tag attached successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Tag already attached" });
    next(err);
  }
});

// Remove a tag
router.delete("/:id/tags/:tagId", authenticate, async (req, res, next) => {
  const { id, tagId } = req.params;
  try {
    const db = await getDB();
    const [result] = await db.query(
      "DELETE FROM individual_tags WHERE individual_id=? AND tag_id=?",
      [id, tagId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Tag relation not found" });
    res.json({ message: "Tag detached successfully" });
  } catch (err) {
    next(err);
  }
});

// Get tags for individual
router.get("/:id/tags", async (req, res, next) => {
  const { id } = req.params;
  try {
    const db = await getDB();
    const [rows] = await db.query(
      `SELECT t.* FROM tags t
       JOIN individual_tags it ON t.id = it.tag_id
       WHERE it.individual_id=?`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
