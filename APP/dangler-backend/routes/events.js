import express from "express";
import { getDB } from "../db.js";
const router = express.Router();

// Helper function to extract and convert the numeric year from the formatted date string
function getNumericYear(dateString) {
  if (!dateString) return null;
  // Assumes YYYY-MM-DD or similar format
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  return year;
}

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

// GET event by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const [events] = await db.query("SELECT * FROM events WHERE id=?", [id]);
    if (events.length === 0) return res.status(404).json({ error: "Event not found" });
    res.json(events[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new event
router.post("/", async (req, res) => {
  try {
    const { individual_id, title, description, event_date } = req.body;
    const db = await getDB();

    if (!event_date) {
      return res.status(400).json({ error: "Event date is required." });
    }

    const event_year_numeric = getNumericYear(event_date);

    const [result] = await db.query(
      "INSERT INTO events (individual_id, title, description, event_date, event_year_numeric) VALUES (?,?,?,?,?)",
      [individual_id, title, description || null, event_date, event_year_numeric]
    );
    const [newEvent] = await db.query("SELECT * FROM events WHERE id=?", [result.insertId]);
    res.json(newEvent[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update event
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date } = req.body;
    const db = await getDB();

    if (!event_date) {
      return res.status(400).json({ error: "Event date is required." });
    }

    const event_year_numeric = getNumericYear(event_date);

    const [result] = await db.query(
      "UPDATE events SET title=?, description=?, event_date=?, event_year_numeric=? WHERE id=?",
      [title, description || null, event_date, event_year_numeric, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Event not found" });
    const [updated] = await db.query("SELECT * FROM events WHERE id=?", [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const [result] = await db.query("DELETE FROM events WHERE id=?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;