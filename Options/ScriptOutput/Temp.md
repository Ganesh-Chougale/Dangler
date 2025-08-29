3. backend:
APP\dangler-backend\db.js:
```js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
export async function getDB() {
return mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
});
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
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/individuals", individualsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/tags", tagsRoutes);
app.get("/test-db", async (req, res) => {
try {
const db = await getDB();
const [rows] = await db.query("SELECT NOW() AS now");
res.json(rows);
} catch (err) {
res.status(500).json({ error: err.message });
}
});
app.get("/protected", authenticate, (req, res) => {
res.json({ message: `Welcome ${req.user.email}, this is protected` });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http:
```

APP\dangler-backend\middleware\auth.js:
```js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
export function authenticate(req, res, next) {
const token = req.headers["authorization"]?.split(" ")[1]; 
if (!token) return res.status(401).json({ error: "No token provided" });
try {
const decoded = jwt.verify(token, JWT_SECRET);
req.user = decoded; 
next();
} catch (err) {
res.status(401).json({ error: "Invalid token" });
}
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
router.post("/register", async (req, res) => {
try {
const { name, email, password } = req.body;
const db = await getDB();
const [existing] = await db.query("SELECT * FROM users WHERE email=?", [email]);
if (existing.length > 0) {
return res.status(400).json({ error: "Email already registered" });
}
const hashed = await bcrypt.hash(password, 10);
await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashed]);
res.json({ message: "User registered successfully" });
} catch (err) {
res.status(500).json({ error: err.message });
}
});
router.post("/login", async (req, res) => {
try {
const { email, password } = req.body;
const db = await getDB();
const [users] = await db.query("SELECT * FROM users WHERE email=?", [email]);
if (users.length === 0) return res.status(400).json({ error: "Invalid credentials" });
const user = users[0];
const match = await bcrypt.compare(password, user.password);
if (!match) return res.status(400).json({ error: "Invalid credentials" });
const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
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
router.get("/", async (req, res) => {
try {
const db = await getDB();
const [events] = await db.query("SELECT * FROM events ORDER BY event_date ASC");
res.json(events);
} catch (err) {
res.status(500).json({ error: err.message });
}
});
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
const router = express.Router();
const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, "uploads/"),
filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
router.get("/", async (req, res) => {
try {
const db = await getDB();
const [individuals] = await db.query(
"SELECT * FROM individuals ORDER BY birth_date IS NULL, birth_date ASC"
);
res.json(individuals);
} catch (err) {
res.status(500).json({ error: err.message });
}
});
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
"SELECT * FROM events WHERE individual_id = ? ORDER BY event_date ASC",
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
router.post("/", upload.single("profile_image"), async (req, res) => {
try {
const db = await getDB();
const { name, category, sub_category, description, birth_date, death_date } = req.body;
const profile_image = req.file ? `/uploads/${req.file.filename}` : null;
const [result] = await db.query(
"INSERT INTO individuals (name, category, sub_category, description, birth_date, death_date, profile_image) VALUES (?,?,?,?,?,?,?)",
[
name,
category,
sub_category || null,
description || null,
birth_date || null,
death_date || null,
profile_image,
]
);
res.json({ id: result.insertId });
} catch (err) {
res.status(500).json({ error: err.message });
}
});
router.put("/:id", upload.single("profile_image"), async (req, res) => {
try {
const { id } = req.params;
const db = await getDB();
const { name, category, sub_category, description, birth_date, death_date } = req.body;
const profile_image = req.file ? `/uploads/${req.file.filename}` : null;
const [result] = await db.query(
`UPDATE individuals 
SET name=?, category=?, sub_category=?, description=?, birth_date=?, death_date=?, 
profile_image = COALESCE(?, profile_image) 
WHERE id=?`,
[
name,
category,
sub_category || null,
description || null,
birth_date || null,
death_date || null,
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
export default router;
```

APP\dangler-backend\routes\tags.js:
```js
import express from "express";
import { getDB } from "../db.js";
const router = express.Router();
router.get("/", async (req, res) => {
try {
const db = await getDB();
const [tags] = await db.query("SELECT * FROM tags");
res.json(tags);
} catch (err) {
res.status(500).json({ error: err.message });
}
});
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
```

4. other necessary things:
# Mysql quaries used.  
## Tables  
### create database
```sql
CREATE DATABASE dangler;
```  
```sql 
USE dangler;
```  
### create user table  
```sql
CREATE TABLE `users` (
   `id` int NOT NULL AUTO_INCREMENT,
   `name` varchar(100) NOT NULL,
   `email` varchar(150) NOT NULL,
   `password` varchar(255) NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   UNIQUE KEY `email` (`email`)
 );
```  
### create Individuals Table  
```sql
CREATE TABLE `individuals` (
   `id` int NOT NULL AUTO_INCREMENT,
   `name` varchar(255) NOT NULL,
   `category` enum('real','fictional','mythological','obscure') NOT NULL,
   `sub_category` varchar(100) DEFAULT NULL,
   `description` text,
   `birth_date` date DEFAULT NULL,
   `death_date` date DEFAULT NULL,
   `profile_image` varchar(500) DEFAULT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`)
 );
```  
### create Events Table  
```sql
CREATE TABLE `events` (
   `id` int NOT NULL AUTO_INCREMENT,
   `individual_id` int NOT NULL,
   `title` varchar(255) NOT NULL,
   `description` text,
   `event_date` date NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   KEY `individual_id` (`individual_id`),
   CONSTRAINT `events_ibfk_1` FOREIGN KEY (`individual_id`) REFERENCES `individuals` (`id`) ON DELETE CASCADE
 );
```  
### Create tag table  
```sql
CREATE TABLE `tags` (
   `id` int NOT NULL AUTO_INCREMENT,
   `name` varchar(100) NOT NULL,
   `type` enum('role','region','theme','other') DEFAULT 'other',
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   UNIQUE KEY `name` (`name`)
 );
```  
### Individual_Tags Table (M:N relation)  
```sql
CREATE TABLE `individual_tags` (
   `individual_id` int NOT NULL,
   `tag_id` int NOT NULL,
   PRIMARY KEY (`individual_id`,`tag_id`),
   KEY `tag_id` (`tag_id`),
   CONSTRAINT `individual_tags_ibfk_1` FOREIGN KEY (`individual_id`) REFERENCES `individuals` (`id`) ON DELETE CASCADE,
   CONSTRAINT `individual_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
 );
```  
# Environment  
- APP\dangler-backend\.env:  
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=root
DB_NAME=dangler
JWT_SECRET=5d3ac6e9f7b9376c4a9a6b7696b2ad9066af7c11c0947c86abf07f0a32505fafad7a3748a
37498eb9be3cc732030fd0370b92c2d6f8f16ed6efa3a087af4f78a
```  