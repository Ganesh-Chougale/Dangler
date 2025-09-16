import express from "express";
import multer from "multer";
import path from "path";
import { getDB } from "../db.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

/* -----------------------------
    🔹 Multer for media upload
-------------------------------*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("Only images or mp4 videos allowed"));
  },
});

/* -----------------------------
    🔹 Helpers
-------------------------------*/
function normalizeDate({ era, year, month, day }) {
  let y = parseInt(year, 10);
  if (era === "BCE") y = -Math.abs(y);
  return {
    year: y,
    month: month ? parseInt(month, 10) : 1,
    day: day ? parseInt(day, 10) : 1,
  };
}

/* -----------------------------
    🔹 Validation rules
-------------------------------*/
const eventValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("year").notEmpty().withMessage("Year is required").isInt().withMessage("Year must be an integer"),
  body("individual_id").notEmpty().withMessage("Individual ID is required").isInt().withMessage("Must be an integer"),
];

/* -----------------------------
    🔹 CRUD: Events
-------------------------------*/

// GET all events
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [events] = await db.query(
      "SELECT * FROM events ORDER BY event_year_numeric ASC, event_date ASC"
    );
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single event
router.get("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const [events] = await db.query("SELECT * FROM events WHERE id=?", [req.params.id]);
    if (!events.length) return res.status(404).json({ error: "Event not found" });
    res.json(events[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new event
router.post("/", upload.single("media"), eventValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const db = await getDB();
    const { individual_id, title, description, era, year, month, day } = req.body;

    const date = normalizeDate({ era, year, month, day });
    const event_date = `${Math.abs(date.year)}-${String(date.month).padStart(2,"0")}-${String(date.day).padStart(2,"0")}`;
    const event_year_numeric = date.year;
    const mediaPath = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      "INSERT INTO events (individual_id, title, description, event_date, event_year_numeric, media) VALUES (?, ?, ?, ?, ?, ?)",
      [individual_id, title, description || "", event_date, event_year_numeric, mediaPath]
    );

    const [rows] = await db.query("SELECT * FROM events WHERE id=?", [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Failed to create event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// PUT update event
router.put("/:id", upload.single("media"), eventValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const db = await getDB();
    const { title, description, era, year, month, day } = req.body;
    const mediaPath = req.file ? `/uploads/${req.file.filename}` : null;

    const date = normalizeDate({ era, year, month, day });
    const event_date = `${Math.abs(date.year)}-${String(date.month).padStart(2,"0")}-${String(date.day).padStart(2,"0")}`;
    const event_year_numeric = date.year;

    const [result] = await db.query(
      `UPDATE events
       SET title=?, description=?, event_date=?, event_year_numeric=?, media=COALESCE(?, media)
       WHERE id=?`,
      [title, description || null, event_date, event_year_numeric, mediaPath, req.params.id]
    );

    if (!result.affectedRows) return res.status(404).json({ error: "Event not found" });

    const [updated] = await db.query("SELECT * FROM events WHERE id=?", [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error("❌ Failed to update event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const [result] = await db.query("DELETE FROM events WHERE id=?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete event:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
