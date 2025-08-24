import express from "express";
import { getDB } from "../db.js";

const router = express.Router();

// GET all individuals
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [individuals] = await db.query("SELECT * FROM individuals ORDER BY birth_date ASC");
    res.json(individuals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single individual with events & tags
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    // Fetch individual
    const [individuals] = await db.query("SELECT * FROM individuals WHERE id=?", [id]);
    if (individuals.length === 0) return res.status(404).json({ error: "Individual not found" });
    const individual = individuals[0];

    // Fetch events
    const [events] = await db.query("SELECT * FROM events WHERE individual_id=? ORDER BY event_date ASC", [id]);

    // Fetch tags
    const [tags] = await db.query(
      `SELECT t.id, t.name, t.type
       FROM tags t
       JOIN individual_tags it ON t.id = it.tag_id
       WHERE it.individual_id = ?`,
      [id]
    );

    res.json({ individual, events, tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new individual + optional events
router.post("/", async (req, res) => {
  try {
    const { name, category, sub_category, description, birth_date, death_date, events: eventsInput, tags: tagIds } = req.body;
    const db = await getDB();

    // Insert individual
    const [result] = await db.query(
      "INSERT INTO individuals (name, category, sub_category, description, birth_date, death_date) VALUES (?, ?, ?, ?, ?, ?)",
      [name, category, sub_category, description, birth_date, death_date]
    );
    const individualId = result.insertId;

    // Insert events
    if (eventsInput && eventsInput.length > 0) {
      const eventValues = eventsInput.map(ev => [individualId, ev.title, ev.description || null, ev.event_date, ev.media_url || null]);
      await db.query(
        "INSERT INTO events (individual_id, title, description, event_date, media_url) VALUES ?",
        [eventValues]
      );
    }

    // Attach tags
    if (tagIds && tagIds.length > 0) {
      const tagValues = tagIds.map(tagId => [individualId, tagId]);
      await db.query(
        "INSERT INTO individual_tags (individual_id, tag_id) VALUES ?",
        [tagValues]
      );
    }

    res.status(201).json({ message: "Individual created successfully", id: individualId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
