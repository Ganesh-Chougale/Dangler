import express from "express";
import { getDB } from "../db.js";

const router = express.Router();

// Input validation
function validateEvent(data) {
  const { individual_id, title, event_date } = data;
  if (!individual_id || !title || !event_date) return false;
  return true;
}

// GET all events
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [events] = await db.query("SELECT * FROM events ORDER BY event_date ASC");
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
    if (!validateEvent(req.body)) return res.status(400).json({ error: "Missing required fields" });
    const { individual_id, title, description, event_date, media_url } = req.body;
    const db = await getDB();

    const [result] = await db.query(
      "INSERT INTO events (individual_id, title, description, event_date, media_url) VALUES (?, ?, ?, ?, ?)",
      [individual_id, title, description || null, event_date, media_url || null]
    );

    res.status(201).json({ message: "Event created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update event
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, media_url } = req.body;
    const db = await getDB();

    const [result] = await db.query(
      "UPDATE events SET title=?, description=?, event_date=?, media_url=? WHERE id=?",
      [title, description || null, event_date, media_url || null, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event updated successfully" });
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
