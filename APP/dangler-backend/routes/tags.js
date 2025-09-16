import express from "express";
import { getDB } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Create a new tag
router.post("/", authenticate, async (req, res) => {
  const { name, type } = req.body;
  try {
    const db = await getDB();
    await db.query("INSERT INTO tags (name, type) VALUES (?, ?)", [name, type]);
    res.json({ message: "Tag created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attach tag to an individual
router.post("/individual/:id", authenticate, async (req, res) => {
  const { tagId } = req.body;
  const individualId = req.params.id;
  try {
    const db = await getDB();
    await db.query(
      "INSERT INTO individual_tags (individual_id, tag_id) VALUES (?, ?)",
      [individualId, tagId]
    );
    res.json({ message: "Tag attached to individual" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tags for an individual
router.get("/individual/:id", async (req, res) => {
  try {
    const db = await getDB();
    const [tags] = await db.query(
      `SELECT t.* FROM tags t
       JOIN individual_tags it ON t.id = it.tag_id
       WHERE it.individual_id = ?`,
      [req.params.id]
    );
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tags
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const [tags] = await db.query("SELECT * FROM tags ORDER BY name ASC");
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unified search endpoint for individuals/events
router.post("/search", async (req, res) => {
  const { include = [], exclude = [], scope = "individuals" } = req.body;
  try {
    const db = await getDB();
    const baseTable = scope === "events" ? "events" : "individuals";
    const joinTable = scope === "events" ? "event_tags" : "individual_tags";
    const pk = scope === "events" ? "event_id" : "individual_id";

    let query = `SELECT DISTINCT i.* FROM ${baseTable} i
                 LEFT JOIN ${joinTable} it ON i.id = it.${pk} WHERE 1=1`;
    let params = [];

    if (include.length > 0) {
      query += ` AND i.id IN (
        SELECT ${pk} FROM ${joinTable} WHERE tag_id IN (${include.map(() => "?").join(",")})
      )`;
      params.push(...include);
    }

    if (exclude.length > 0) {
      query += ` AND i.id NOT IN (
        SELECT ${pk} FROM ${joinTable} WHERE tag_id IN (${exclude.map(() => "?").join(",")})
      )`;
      params.push(...exclude);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;