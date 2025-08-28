import express from "express";
import { getDB } from "../db.js";

const router = express.Router();

// Get all tags
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [tags] = await db.query("SELECT * FROM tags");
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tags for an individual
router.get("/individual/:id", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      `SELECT t.* 
       FROM tags t
       JOIN individual_tags it ON t.id = it.tag_id
       WHERE it.individual_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign tag to an individual
router.post("/assign", async (req, res) => {
  try {
    const { individual_id, tag_id } = req.body;
    const db = await getDB();
    await db.query(
      "INSERT IGNORE INTO individual_tags (individual_id, tag_id) VALUES (?, ?)",
      [individual_id, tag_id]
    );
    res.json({ message: "Tag assigned" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove tag from an individual
router.delete("/assign", async (req, res) => {
  try {
    const { individual_id, tag_id } = req.body;
    const db = await getDB();
    await db.query(
      "DELETE FROM individual_tags WHERE individual_id=? AND tag_id=?",
      [individual_id, tag_id]
    );
    res.json({ message: "Tag removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
