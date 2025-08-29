import express from "express";
import { getDB } from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * User: Report a tag (any logged-in user can do this)
 */
router.post("/report/:tagId", authenticate, async (req, res) => {
  const tagId = req.params.tagId;
  try {
    const db = await getDB();
    await db.query(
      "INSERT INTO tag_moderation (tag_id, reported_by) VALUES (?, ?)", 
      [tagId, req.user.id]
    );
    res.json({ message: "Tag reported for moderation" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin: Review a tag (approve / reject)
 */
router.post("/review/:id", authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  try {
    const db = await getDB();
    await db.query(
      "UPDATE tag_moderation SET status=?, reviewed_by=? WHERE id=?",
      [status, req.user.id, req.params.id]
    );
    res.json({ message: "Tag reviewed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin: Get all pending reports
 */
router.get("/pending", authenticate, requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      `SELECT tm.*, t.name 
       FROM tag_moderation tm
       JOIN tags t ON tm.tag_id = t.id
       WHERE tm.status='pending'`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
