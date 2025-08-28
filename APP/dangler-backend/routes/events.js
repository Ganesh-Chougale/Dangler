import express from "express";
import { getDB } from "../db.js";

const router = express.Router();

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
    const { individual_id, title, description, event_date } = req.body;
    const db = await getDB();

    const [result] = await db.query(
      "INSERT INTO events (individual_id, title, description, event_date) VALUES (?,?,?,?)",
      [individual_id, title, description || null, event_date]
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

    const [result] = await db.query(
      "UPDATE events SET title=?, description=?, event_date=? WHERE id=?",
      [title, description || null, event_date, id]
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
