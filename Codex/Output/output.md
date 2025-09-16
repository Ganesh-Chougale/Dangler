# Codebase Report

## Folder Structure
```
APP
├── dangler-backend/
│   ├── .env
│   ├── db.js
│   ├── index.js
│   ├── middleware/
│   │   └── auth.js
│   ├── package-lock.json
│   ├── package.json
│   └── routes/
│       ├── auth.js
│       ├── events.js
│       ├── individuals.js
│       ├── tagModeration.js
│       └── tags.js
├── dangler-frontend/
│   ├── .gitignore
│   ├── .next/
│   │   ├── app-build-manifest.json
│   │   ├── build-manifest.json
│   │   ├── cache/
│   │   ├── package.json
│   │   ├── prerender-manifest.json
│   │   ├── react-loadable-manifest.json
│   │   ├── routes-manifest.json
│   │   ├── server/
│   │   ├── static/
│   │   ├── trace
│   │   └── types/
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── README.md
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── context/
│   ├── tailwind.config.js
│   └── tsconfig.json
└── MYSQL.md
```

---

## Fixed Text
## MYSQL  
### Create DB schema:  
```sql
CREATE DATABASE dangler;
USE dangler;
```  
### Tables  
```sql  
CREATE TABLE `users` (
   `id` int NOT NULL AUTO_INCREMENT,
   `name` varchar(100) NOT NULL,
   `email` varchar(150) NOT NULL,
   `password` varchar(255) NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `role` enum('user','admin') NOT NULL DEFAULT 'user',
   PRIMARY KEY (`id`),
   UNIQUE KEY `email` (`email`)
 );
 
 CREATE TABLE `individuals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` enum('real','fictional','mythological','obscure') NOT NULL,
  `sub_category` varchar(100) DEFAULT NULL,
  `description` text,
  `birth_date` VARCHAR(10) DEFAULT NULL,
  `birth_year_numeric` INT DEFAULT NULL,
  `death_date` VARCHAR(10) DEFAULT NULL,
  `death_year_numeric` INT DEFAULT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `individual_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_date` VARCHAR(10) NOT NULL,
  `event_year_numeric` INT NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `individual_id` (`individual_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`individual_id`) REFERENCES `individuals` (`id`) ON DELETE CASCADE
);

CREATE TABLE `tags` (
   `id` int NOT NULL AUTO_INCREMENT,
   `name` varchar(100) NOT NULL,
   `type` enum('role','region','theme','other','character','species','era') DEFAULT 'other',
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   UNIQUE KEY `name` (`name`)
 );
 
 CREATE TABLE event_tags (
  event_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (event_id, tag_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE tag_moderation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag_id INT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reported_by INT DEFAULT NULL,
  reviewed_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE `individual_tags` (
   `individual_id` int NOT NULL,
   `tag_id` int NOT NULL,
   PRIMARY KEY (`individual_id`,`tag_id`),
   KEY `tag_id` (`tag_id`),
   CONSTRAINT `individual_tags_ibfk_1` FOREIGN KEY (`individual_id`) REFERENCES `individuals` (`id`) ON DELETE CASCADE,
   CONSTRAINT `individual_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
 );
```  


---

## Code Summary
APP\dangler-backend\db.js:
```js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
let pool;
export function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      connectionLimit: 10,
    });
  }
  return pool;
}
```

APP\dangler-backend\index.js:
```js
import express from "express";
import cors from "cors";
import { getDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import { authenticate } from "./middleware/auth.js";
import individualsRoutes from "./routes/individuals.js";
import eventsRoutes from "./routes/events.js";
import tagsRoutes from "./routes/tags.js";
import tagRoutes from "./routes/tags.js";
import tagModerationRoutes from "./routes/tagModeration.js";
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/individuals", individualsRoutes);
app.use("/api/events", eventsRoutes);
// app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/tags", tagsRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/tag-moderation", tagModerationRoutes);
// DB test route
app.get("/test-db", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT NOW() AS now");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Protected route (JWT required)
app.get("/protected", authenticate, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, this is protected` });
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
```

APP\dangler-backend\middleware\auth.js:
```js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
// ✅ Check if logged in
export function authenticate(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "No token provided" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token format" });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = decoded; // { id, email, role }
    next();
  });
}
// ✅ Extra guard for admin-only routes
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
```

APP\dangler-backend\routes\auth.js:
```js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../db.js";
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = await getDB();
    // check existing user
    const [existing] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    // hash password
    const hashed = await bcrypt.hash(password, 10);
    // insert with default role = 'user'
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hashed]
    );
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDB();
    const [users] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (users.length === 0) return res.status(400).json({ error: "Invalid credentials" });
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });
    // create token with role
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
```

APP\dangler-backend\routes\events.js:
```js
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
```

APP\dangler-backend\routes\individuals.js:
```js
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
```

APP\dangler-backend\routes\tags.js:
```js
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
// Search individuals by tags
router.post("/search", async (req, res) => {
  const { include = [], exclude = [] } = req.body; // e.g. { include: [1,2], exclude: [3] }
  try {
    const db = await getDB();
    let query = `
      SELECT i.* FROM individuals i
      LEFT JOIN individual_tags it ON i.id = it.individual_id
      WHERE 1=1
    `;
    if (include.length > 0) {
      query += ` AND i.id IN (
        SELECT individual_id FROM individual_tags WHERE tag_id IN (${include.join(",")})
      )`;
    }
    if (exclude.length > 0) {
      query += ` AND i.id NOT IN (
        SELECT individual_id FROM individual_tags WHERE tag_id IN (${exclude.join(",")})
      )`;
    }
    const [rows] = await db.query(query);
    res.json(rows);
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
// Search individuals/events by tags
router.post("/search", async (req, res) => {
  const { include = [], exclude = [], scope = "individuals" } = req.body;
  // scope: "individuals" | "events"
  try {
    const db = await getDB();
    let baseTable = scope === "events" ? "events" : "individuals";
    let joinTable = scope === "events" ? "event_tags" : "individual_tags";
    let pk = scope === "events" ? "event_id" : "individual_id";
    let query = `
      SELECT DISTINCT i.*
      FROM ${baseTable} i
      LEFT JOIN ${joinTable} it ON i.id = it.${pk}
      WHERE 1=1
    `;
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
```

APP\dangler-frontend\eslint.config.mjs:
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
export default eslintConfig;
```

APP\dangler-frontend\src\app\admin\page.tsx:
```typescript
"use client";
import { useAuth } from "../../context/AuthContext";
export default function AdminPage() {
  const { user, token } = useAuth();
  if (!user) return <p>Please login first.</p>;
  if (user.role !== "admin") return <p>🚫 Access Denied: Admins only.</p>;
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {user.name} (Role: {user.role})</p>
      {/* Example: call protected API */}
      <button
        onClick={async () => {
          const res = await fetch("http://localhost:5000/api/tagModeration/pending", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          console.log(data);
          alert("Check console for pending reports!");
        }}
        className="mt-4 bg-red-600 text-white p-2"
      >
        Load Pending Reports
      </button>
    </div>
  );
}
```

APP\dangler-frontend\src\app\auth\login\page.tsx:
```typescript
"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.user, data.token);
        setMsg(`✅ Login successful! Welcome ${data.user.name} (Role: ${data.user.role})`);
      } else {
        setMsg(`❌ ${data.error || "Login failed"}`);
      }
    } catch (err: any) {
      setMsg("❌ Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
        <input
          className="p-2 border"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          className="p-2 border"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white p-2 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
```

APP\dangler-frontend\src\app\auth\register\page.tsx:
```typescript
"use client";
import { useState } from "react";
export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
        <input className="p-2 border" placeholder="Name" type="text"
          onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="p-2 border" placeholder="Email" type="email"
          onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="p-2 border" placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="bg-blue-600 text-white p-2">Register</button>
      </form>
      {msg && <p className="mt-2">{msg}</p>}
    </div>
  );
}
```

APP\dangler-frontend\src\app\events\[id]\add-event.tsx:
```typescript
"use client";
import { useState } from "react";
export default function AddEventPage({ params }: { params: { id: string } }) {
  const individualId = parseInt(params.id, 10);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let mediaUrl = null;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      mediaUrl = data.url;
    }
    await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        individual_id: individualId,
        title,
        description,
        event_date: date,
        media_url: mediaUrl,
      }),
    });
    alert("Event created!");
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <input
        type="text"
        placeholder="Event title"
        className="border p-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        className="border p-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        className="border p-2"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2">
        Save Event
      </button>
    </form>
  );
}
```

APP\dangler-frontend\src\app\events\[id]\EventCard.tsx:
```typescript
type EventCardProps = {
  title: string;
  description: string;
  date: string;
  media_url?: string;
};
export default function EventCard({ title, description, date, media_url }: EventCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-gray-800">
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-gray-500">{date}</p>
      <p className="mt-2">{description}</p>
      {media_url && (
        <div className="mt-3">
          {media_url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
            <img src={media_url} alt={title} className="max-h-60 w-auto rounded-md mx-auto" />
          ) : media_url.match(/\.(mp4|webm)$/i) ? (
            <video src={media_url} controls className="max-h-60 mx-auto rounded-md" />
          ) : (
            <a href={media_url} target="_blank" className="text-blue-600 underline">
              View Media
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

APP\dangler-frontend\src\app\globals.css:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

APP\dangler-frontend\src\app\individuals\new\page.tsx:
```typescript
"use client";
import IndividualForm from "@/components/IndividualForm";
export default function NewIndividualPage() {
  const handleSubmit = async (data: any) => {
    try {
      // Convert empty death_date to null
      const payload = {
        ...data,
        death_date: data.death_date || null
      };
      const res = await fetch("http://localhost:5000/api/individuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const responseData = await res.json();
      if (res.ok) {
        alert("Individual created!");
      } else {
        alert(`Failed to create individual: ${responseData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error creating individual:", err);
      alert("Failed to connect to the server. Please try again later.");
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Add New Individual</h1>
      <IndividualForm onSubmit={handleSubmit} />
    </div>
  );
}
```

APP\dangler-frontend\src\app\individuals\page.tsx:
```typescript
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiSearch, FiCalendar, FiClock, FiUser, FiFilter, FiChevronDown } from "react-icons/fi";
interface Individual {
  id: number;
  name: string;
  category: string;
  description: string;
  birth_date: string;
  death_date?: string | null;
  profile_image?: string | null;   // ✅ added profile image
}
export default function IndividualsPage() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const categories = ["all", "real", "fictional", "historical"];
  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5000/api/individuals")
      .then(res => res.json())
      .then(data => {
        setIndividuals(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);
  const filteredIndividuals = individuals.filter(ind => {
    const matchesSearch =
      ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      ind.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      real: "from-blue-500 to-cyan-400",
      fictional: "from-purple-500 to-pink-400",
      historical: "from-amber-500 to-yellow-400",
      default: "from-gray-500 to-gray-400",
    };
    return colors[category.toLowerCase()] || colors.default;
  };
  const getCategoryTextColor = (category: string) => {
    const colors: Record<string, string> = {
      real: "text-blue-700",
      fictional: "text-purple-700",
      historical: "text-amber-700",
      default: "text-gray-700",
    };
    return colors[category.toLowerCase()] || colors.default;
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mb-4"></div>
          <p className="text-gray-600">Loading individuals...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold tracking-tight">Individuals</h1>
              <p className="mt-2 text-blue-100 max-w-2xl">
                Browse and manage all individuals in the system. Track their
                timelines, events, and important details.
              </p>
            </div>
            <Link
              href="/individuals/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              <FiPlus className="mr-2 -ml-1 h-5 w-5" />
              Add New Individual
            </Link>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center justify-between w-full md:w-40 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="flex items-center">
                  <FiFilter className="mr-2 h-4 w-4" />
                  {selectedCategory === "all"
                    ? "All Categories"
                    : selectedCategory.charAt(0).toUpperCase() +
                      selectedCategory.slice(1)}
                </span>
                <FiChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${
                    isFilterOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          selectedCategory === category
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {category.charAt(0).toUpperCase() +
                          category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Individuals Grid */}
        {filteredIndividuals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <FiUser className="w-full h-full" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No individuals found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding a new individual."}
            </p>
            <div className="mt-6">
              <Link
                href="/individuals/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                New Individual
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredIndividuals.map((ind) => (
              <Link
                key={ind.id}
                href={`/individuals/${ind.id}`}
                className="group bg-white overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
              >
                <div
                  className={`h-2 bg-gradient-to-r ${getCategoryColor(
                    ind.category
                  )}`}
                ></div>
                <div className="p-6">
                  {/* ✅ Show profile image if available */}
                  {ind.profile_image && (
                    <img
                      src={`http://localhost:5000${ind.profile_image}`}
                      alt={ind.name}
                      className="w-16 h-16 rounded-full object-cover mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {ind.name}
                    </h2>
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${getCategoryTextColor(
                        ind.category
                      )}`}
                    >
                      {ind.category.charAt(0).toUpperCase() +
                        ind.category.slice(1)}
                    </span>
                  </div>
                  {ind.description && (
                    <p className="mt-3 text-gray-600 line-clamp-2">
                      {ind.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="flex-shrink-0 mr-2 h-4 w-4" />
                      <span className="truncate">
                        {formatDate(ind.birth_date)} -{" "}
                        {ind.death_date
                          ? formatDate(ind.death_date)
                          : "Present"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <FiClock className="mr-1.5 h-3.5 w-3.5" />
                      <span>Updated {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

APP\dangler-frontend\src\app\individuals\[id]\events\new\page.tsx:
```typescript
"use client";
import { useParams } from "next/navigation";
import EventForm from "@/components/EventForm";
export default function NewEventPage() {
  const params = useParams();
  const individualId = Number(params.id);
  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (res.ok) {
        alert("Event created!");
      } else {
        alert(`Failed: ${responseData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to connect to the server.");
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Add New Event</h1>
      <EventForm individualId={individualId} onSubmit={handleSubmit} />
    </div>
  );
}
```

APP\dangler-frontend\src\app\individuals\[id]\page.tsx:
```typescript
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Group } from "@visx/group";
import { Line, Circle } from "@visx/shape";
import { scaleTime } from "@visx/scale";
import { Tooltip, useTooltip, TooltipWithBounds } from "@visx/tooltip";
import TagSelector from "../../../components/TagSelector";
interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string;
}
interface Tag {
  id: number;
  name: string;
}
interface Individual {
  id: number;
  name: string;
  category: string;
  birth_date: string;
  death_date?: string;
  description: string;
  profile_image?: string;
}
export default function IndividualPage() {
  const params = useParams();
  const id = params.id;
  const [individual, setIndividual] = useState<Individual | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  // Tooltip
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<Event>();
  useEffect(() => {
    fetch(`http://localhost:5000/api/individuals/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setIndividual(data.individual);
        setEvents(
          data.events.sort(
            (a: Event, b: Event) =>
              new Date(a.event_date).getTime() -
              new Date(b.event_date).getTime()
          )
        );
        setTags(data.tags || []);
      })
      .catch((err) => console.error(err));
  }, [id]);
  if (!individual) return <p className="p-8">Loading...</p>;
  // Visx timeline setup
  const width = 120;
  const height = 500;
  const margin = { top: 20, bottom: 20 };
  const timeScale = scaleTime({
    domain: [
      new Date(individual.birth_date),
      individual.death_date ? new Date(individual.death_date) : new Date(),
    ],
    range: [margin.top, height - margin.bottom],
  });
  return (
    <div className="p-8 flex gap-12">
      {/* Left side: individual info */}
      <div className="w-1/3">
        {individual.profile_image && (
          <img
            src={`http://localhost:5000${individual.profile_image}`}
            alt={`${individual.name} profile`}
            className="w-32 h-32 rounded-full mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-4">{individual.name}</h1>
        <p className="text-gray-700">{individual.description}</p>
        <p className="text-gray-500 mt-1">
          {individual.birth_date?.slice(0, 10)} –{" "}
          {individual.death_date ? individual.death_date.slice(0, 10) : "Present"}
        </p>
        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Tags</h3>
            <div className="flex gap-2 flex-wrap mt-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Tag Selector */}
        <TagSelector individualId={Number(id)} />
      </div>
      {/* Rope timeline */}
      <div className="relative">
        <svg width={width} height={height}>
          <Line
            from={{ x: width / 2, y: margin.top }}
            to={{ x: width / 2, y: height - margin.bottom }}
            stroke="black"
            strokeWidth={2}
          />
          <Group>
            {events.map((ev) => {
              const y = timeScale(new Date(ev.event_date)) || 0;
              return (
                <Circle
                  key={ev.id}
                  cx={width / 2}
                  cy={y}
                  r={6}
                  fill="blue"
                  onMouseMove={(e) =>
                    showTooltip({
                      tooltipData: ev,
                      tooltipLeft: e.clientX,
                      tooltipTop: e.clientY,
                    })
                  }
                  onMouseLeave={hideTooltip}
                />
              );
            })}
          </Group>
        </svg>
        {tooltipData && (
          <TooltipWithBounds top={tooltipTop} left={tooltipLeft}>
            <div className="p-2">
              <p className="font-bold">{tooltipData.title}</p>
              {tooltipData.description && (
                <p className="text-sm">{tooltipData.description}</p>
              )}
              <p className="text-gray-500 text-xs">
                {tooltipData.event_date?.slice(0, 10)}
              </p>
            </div>
          </TooltipWithBounds>
        )}
      </div>
    </div>
  );
}
```

APP\dangler-frontend\src\app\layout.tsx:
```typescript
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
```

APP\dangler-frontend\src\app\page.module.css:
```css
.page {
  --gray-rgb: 0, 0, 0;
  --gray-alpha-200: rgba(var(--gray-rgb), 0.08);
  --gray-alpha-100: rgba(var(--gray-rgb), 0.05);
  --button-primary-hover: #383838;
  --button-secondary-hover: #f2f2f2;
  display: grid;
  grid-template-rows: 20px 1fr 20px;
  align-items: center;
  justify-items: center;
  min-height: 100svh;
  padding: 80px;
  gap: 64px;
  font-family: var(--font-geist-sans);
}
@media (prefers-color-scheme: dark) {
  .page {
    --gray-rgb: 255, 255, 255;
    --gray-alpha-200: rgba(var(--gray-rgb), 0.145);
    --gray-alpha-100: rgba(var(--gray-rgb), 0.06);
    --button-primary-hover: #ccc;
    --button-secondary-hover: #1a1a1a;
  }
}
.main {
  display: flex;
  flex-direction: column;
  gap: 32px;
  grid-row-start: 2;
}
.main ol {
  font-family: var(--font-geist-mono);
  padding-left: 0;
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: -0.01em;
  list-style-position: inside;
}
.main li:not(:last-of-type) {
  margin-bottom: 8px;
}
.main code {
  font-family: inherit;
  background: var(--gray-alpha-100);
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
}
.ctas {
  display: flex;
  gap: 16px;
}
.ctas a {
  appearance: none;
  border-radius: 128px;
  height: 48px;
  padding: 0 20px;
  border: 1px solid transparent;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
}
a.primary {
  background: var(--foreground);
  color: var(--background);
  gap: 8px;
}
a.secondary {
  border-color: var(--gray-alpha-200);
  min-width: 158px;
}
.footer {
  grid-row-start: 3;
  display: flex;
  gap: 24px;
}
.footer a {
  display: flex;
  align-items: center;
  gap: 8px;
}
.footer img {
  flex-shrink: 0;
}
/* Enable hover only on non-touch devices */
@media (hover: hover) and (pointer: fine) {
  a.primary:hover {
    background: var(--button-primary-hover);
    border-color: transparent;
  }
  a.secondary:hover {
    background: var(--button-secondary-hover);
    border-color: transparent;
  }
  .footer a:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
}
@media (max-width: 600px) {
  .page {
    padding: 32px;
    padding-bottom: 80px;
  }
  .main {
    align-items: center;
  }
  .main ol {
    text-align: center;
  }
  .ctas {
    flex-direction: column;
  }
  .ctas a {
    font-size: 14px;
    height: 40px;
    padding: 0 16px;
  }
  a.secondary {
    min-width: auto;
  }
  .footer {
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
}
@media (prefers-color-scheme: dark) {
  .logo {
    filter: invert();
  }
}
```

APP\dangler-frontend\src\app\page.tsx:
```typescript
"use client";
import { useEffect, useState } from "react";
export default function Home() {
  const [serverTime, setServerTime] = useState("");
  useEffect(() => {
    fetch("http://localhost:5000/test-db")
      .then((res) => res.json())
      .then((data) => setServerTime(JSON.stringify(data)))
      .catch((err) => setServerTime("Error: " + err.message));
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">Hello Dangler 👋</h1>
      <p className="mt-2 text-gray-700">Frontend is working with Tailwind ✅</p>
      <div className="mt-4 p-4 bg-white shadow rounded">
        <p className="font-mono text-sm">Backend says:</p>
        <pre className="text-green-600">{serverTime}</pre>
      </div>
    </main>
  );
}
```

APP\dangler-frontend\src\app\search\page.tsx:
```typescript

```

APP\dangler-frontend\src\components\EventForm.tsx:
```typescript
"use client";
import { useState } from "react";
interface EventFormProps {
  initialData?: {
    title?: string;
    description?: string;
    event_date_bc?: boolean;
    event_day?: number | null;
    event_month?: number | null;
    event_year?: number | null;
    individual_id?: number;
  };
  individualId: number;
  onSubmit: (data: any) => void;
}
export default function EventForm({ initialData, individualId, onSubmit }: EventFormProps) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    event_date_bc: initialData?.event_date_bc || false,
    event_day: initialData?.event_day || null,
    event_month: initialData?.event_month || null,
    event_year: initialData?.event_year || null,
    individual_id: initialData?.individual_id || individualId,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numValue = value ? parseInt(value, 10) : null;
      setForm({ ...form, [name]: numValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const handleADBCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      event_date_bc: e.target.value === 'bc',
    });
  };
  // Helper function to format date
  const formatDate = (year: number | null, month: number | null, day: number | null) => {
    if (!year) return null;
    const formattedYear = Math.abs(year);
    const formattedMonth = month ? String(month).padStart(2, '0') : '00';
    const formattedDay = day ? String(day).padStart(2, '0') : '00';
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { event_year, event_month, event_day } = form;
    if (!event_year) {
      alert("Year is a required field.");
      return;
    }
    if (event_month && (event_month < 1 || event_month > 12)) {
      alert("Month must be between 1 and 12.");
      return;
    }
    if (event_day) {
      if (event_day < 1 || event_day > 31) {
        alert("Day must be a valid number (1-31).");
        return;
      }
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (event_month === 2) {
        const isLeap = (event_year % 4 === 0 && event_year % 100 !== 0) || (event_year % 400 === 0);
        if (isLeap && event_day > 29) {
          alert("February in a leap year only has 29 days.");
          return;
        } else if (!isLeap && event_day > 28) {
          alert("February only has 28 days.");
          return;
        }
      } else if (event_month && event_day > daysInMonth[event_month - 1]) {
        alert("Day is not valid for the selected month.");
        return;
      }
    }
    // Format the date into a single string for backend
    const formattedDate = formatDate(form.event_year, form.event_month, form.event_day);
    // Prepare data for submission, including BC flag and formatted date string
    onSubmit({
      ...form,
      event_date: formattedDate,
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input
        type="text"
        name="title"
        placeholder="Event Title"
        value={form.title}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <textarea
        name="description"
        placeholder="Event Description"
        value={form.description}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <div className="flex space-x-2 items-center">
        <label className="text-sm font-semibold">Date Type:</label>
        <div className="flex space-x-4">
          <label>
            <input
              type="radio"
              name="ad_bc"
              value="ad"
              checked={!form.event_date_bc}
              onChange={handleADBCChange}
            /> AD/CE
          </label>
          <label>
            <input
              type="radio"
              name="ad_bc"
              value="bc"
              checked={form.event_date_bc}
              onChange={handleADBCChange}
            /> BC/BCE
          </label>
        </div>
      </div>
      <div className="flex space-x-2">
        <input
          type="number"
          name="event_day"
          placeholder="Day (optional)"
          value={form.event_day === null ? '' : form.event_day}
          onChange={handleChange}
          className="border p-2 w-1/3"
        />
        <input
          type="number"
          name="event_month"
          placeholder="Month (optional)"
          value={form.event_month === null ? '' : form.event_month}
          onChange={handleChange}
          className="border p-2 w-1/3"
        />
        <input
          type="number"
          name="event_year"
          placeholder="Year"
          value={form.event_year === null ? '' : form.event_year}
          onChange={handleChange}
          className="border p-2 w-1/3"
          required
        />
      </div>
      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Save Event
      </button>
    </form>
  );
}
```

APP\dangler-frontend\src\components\IndividualForm.tsx:
```typescript
"use client";
import { useState } from "react";
interface IndividualFormProps {
  initialData?: {
    name?: string;
    category?: string;
    sub_category?: string;
    description?: string;
    birth_date_bc?: boolean;
    birth_day?: number | null;
    birth_month?: number | null;
    birth_year?: number | null;
    death_date_bc?: boolean;
    death_day?: number | null;
    death_month?: number | null;
    death_year?: number | null;
    profile_image?: string;
  };
  onSubmit: (data: FormData) => void;
}
export default function IndividualForm({ initialData, onSubmit }: IndividualFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "real",
    sub_category: initialData?.sub_category || "",
    description: initialData?.description || "",
    birth_date_bc: initialData?.birth_date_bc || false,
    birth_day: initialData?.birth_day || null,
    birth_month: initialData?.birth_month || null,
    birth_year: initialData?.birth_year || null,
    death_date_bc: initialData?.death_date_bc || false,
    death_day: initialData?.death_day || null,
    death_month: initialData?.death_month || null,
    death_year: initialData?.death_year || null,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numValue = value ? parseInt(value, 10) : null;
      setForm({ ...form, [name]: numValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const handleADBCChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value === 'bc',
    });
  };
  // Helper function to format date
  const formatDate = (year: number | null, month: number | null, day: number | null, isBC: boolean) => {
    if (!year) return null;
    const yearValue = isBC ? -year : year;
    const formattedYear = String(Math.abs(yearValue)).padStart(4, '0');
    const formattedMonth = month ? String(month).padStart(2, '0') : '00';
    const formattedDay = day ? String(day).padStart(2, '0') : '00';
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reusable validation function
    const validateDate = (year: number | null, month: number | null, day: number | null, fieldName: string) => {
      if (!year) {
        alert(`${fieldName} Year is a required field.`);
        return false;
      }
      if (month && (month < 1 || month > 12)) {
        alert(`${fieldName} Month must be between 1 and 12.`);
        return false;
      }
      if (day) {
        if (day < 1 || day > 31) {
          alert(`${fieldName} Day must be a valid number (1-31).`);
          return false;
        }
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (month === 2) {
          const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
          if (isLeap && day > 29) {
            alert(`${fieldName} February in a leap year only has 29 days.`);
            return false;
          } else if (!isLeap && day > 28) {
            alert(`${fieldName} February only has 28 days.`);
            return false;
          }
        } else if (month && day > daysInMonth[month - 1]) {
          alert(`${fieldName} Day is not valid for the selected month.`);
          return false;
        }
      }
      return true;
    };
    if (form.birth_year && !validateDate(form.birth_year, form.birth_month, form.birth_day, 'Birth Date')) {
      return;
    }
    if (form.death_year && !validateDate(form.death_year, form.death_month, form.death_day, 'Death Date')) {
      return;
    }
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("sub_category", form.sub_category);
    formData.append("description", form.description);
    // Format and append birth date
    const formattedBirthDate = formatDate(form.birth_year, form.birth_month, form.birth_day, form.birth_date_bc);
    if (formattedBirthDate) formData.append("birth_date", formattedBirthDate);
    // Format and append death date
    const formattedDeathDate = formatDate(form.death_year, form.death_month, form.death_day, form.death_date_bc);
    if (formattedDeathDate) formData.append("death_date", formattedDeathDate);
    if (profileImage) formData.append("profile_image", profileImage);
    onSubmit(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="real">Real</option>
        <option value="fictional">Fictional</option>
        <option value="mythological">Mythological</option>
        <option value="obscure">Obscure</option>
      </select>
      <input
        type="text"
        name="sub_category"
        placeholder="Sub Category (e.g., movie)"
        value={form.sub_category}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <div className="border p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Birth Date</h3>
        <div className="flex space-x-2 items-center mb-2">
          <label className="text-sm font-semibold">Date Type:</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="birth_date_ad_bc"
                value="ad"
                checked={!form.birth_date_bc}
                onChange={() => handleADBCChange("birth_date_bc", "ad")}
              /> AD/CE
            </label>
            <label>
              <input
                type="radio"
                name="birth_date_ad_bc"
                value="bc"
                checked={form.birth_date_bc}
                onChange={() => handleADBCChange("birth_date_bc", "bc")}
              /> BC/BCE
            </label>
          </div>
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            name="birth_day"
            placeholder="Day (optional)"
            value={form.birth_day === null ? '' : form.birth_day}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
          <input
            type="number"
            name="birth_month"
            placeholder="Month (optional)"
            value={form.birth_month === null ? '' : form.birth_month}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
          <input
            type="number"
            name="birth_year"
            placeholder="Year (optional)"
            value={form.birth_year === null ? '' : form.birth_year}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
        </div>
      </div>
      <div className="border p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Death Date</h3>
        <div className="flex space-x-2 items-center mb-2">
          <label className="text-sm font-semibold">Date Type:</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="death_date_ad_bc"
                value="ad"
                checked={!form.death_date_bc}
                onChange={() => handleADBCChange("death_date_bc", "ad")}
              /> AD/CE
            </label>
            <label>
              <input
                type="radio"
                name="death_date_ad_bc"
                value="bc"
                checked={form.death_date_bc}
                onChange={() => handleADBCChange("death_date_bc", "bc")}
              /> BC/BCE
            </label>
          </div>
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            name="death_day"
            placeholder="Day (optional)"
            value={form.death_day === null ? '' : form.death_day}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
          <input
            type="number"
            name="death_month"
            placeholder="Month (optional)"
            value={form.death_month === null ? '' : form.death_month}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
          <input
            type="number"
            name="death_year"
            placeholder="Year (optional)"
            value={form.death_year === null ? '' : form.death_year}
            onChange={handleChange}
            className="border p-2 w-1/3"
          />
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
        className="border p-2 w-full"
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </form>
  );
}
```

APP\dangler-frontend\src\components\Modal.tsx:
```typescript
"use client";
import { ReactNode } from "react";
export default function Modal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full">
        <button onClick={onClose} className="text-red-500 float-right">X</button>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
```

APP\dangler-frontend\src\components\Navbar.tsx:
```typescript
"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      {/* Left side (branding / home link) */}
      <Link href="/" className="text-lg font-bold">
        Dangler
      </Link>
      {/* Right side (links / auth) */}
      <div className="flex gap-4 items-center">
        {!user && (
          <>
            <Link href="/auth/login" className="hover:underline">
              Login
            </Link>
            <Link href="/auth/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
        {user && (
          <>
            <span className="text-sm">
              👋 {user.name} ({user.role})
            </span>
            {/* Admin-only link */}
            {user.role === "admin" && (
              <Link href="/admin" className="hover:underline text-red-400">
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-600 px-2 py-1 rounded text-sm hover:bg-red-700"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
```

APP\dangler-frontend\src\components\TagSearch.tsx:
```typescript
"use client";
import { useState, useEffect } from "react";
export default function TagSearch() {
  const [allTags, setAllTags] = useState<any[]>([]);
  const [include, setInclude] = useState<number[]>([]);
  const [exclude, setExclude] = useState<number[]>([]);
  const [results, setResults] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`)
      .then(res => res.json())
      .then(setAllTags);
  }, []);
  const search = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ include, exclude, scope: "individuals" })
    });
    setResults(await res.json());
  };
  return (
    <div>
      <h3>Tag Search</h3>
      <div>
        <h4>Include Tags</h4>
        <select onChange={e => setInclude([...include, Number(e.target.value)])}>
          <option value="">Select tag</option>
          {allTags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>
      <div>
        <h4>Exclude Tags</h4>
        <select onChange={e => setExclude([...exclude, Number(e.target.value)])}>
          <option value="">Select tag</option>
          {allTags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>
      <button onClick={search}>Search</button>
      <ul>
        {results.map(r => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

APP\dangler-frontend\src\components\TagSelector.tsx:
```typescript
"use client";
import { useState, useEffect } from "react";
export default function TagSelector({ individualId }: { individualId: number }) {
  const [tags, setTags] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [newTag, setNewTag] = useState("");
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/individual/${individualId}`)
      .then(res => res.json())
      .then(setTags);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`)
      .then(res => res.json())
      .then(setAllTags);
  }, [individualId]);
  const attachTag = async (tagId: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/individual/${individualId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId })
    });
    setTags([...tags, allTags.find(t => t.id === tagId)]);
  };
  const createTag = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag, type: "other" })
    });
    setNewTag("");
  };
  return (
    <div>
      <h3>Tags</h3>
      <ul>
        {tags.map(tag => (
          <li key={tag.id} className="inline-block bg-gray-200 px-2 py-1 m-1 rounded">
            {tag.name}
          </li>
        ))}
      </ul>
      <div>
        <select onChange={e => attachTag(Number(e.target.value))}>
          <option>Add existing tag</option>
          {allTags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>
      <div>
        <input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="New tag" />
        <button onClick={createTag}>Add</button>
      </div>
    </div>
  );
}
```

APP\dangler-frontend\src\context\AuthContext.tsx:
```typescript
"use client";
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
type UserType = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
};
type AuthContextType = {
  user: UserType | null;
  token: string | null;
  login: (user: UserType, token: string) => void;
  logout: () => void;
};
const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);
  const login = (userData: UserType, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext)!;
```

APP\dangler-frontend\tailwind.config.js:
```js
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```



---

## Previous Takes


---



## Final Instruction
_Instructions file is empty._