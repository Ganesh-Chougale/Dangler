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
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);   
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
fetch("http:
headers: { Authorization: `Bearer ${token}` },
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

APP\dangler-frontend\src\app\auth\login\page.tsx:
```typescript
"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
export default function LoginPage() {
const { login } = useAuth();
const [form, setForm] = useState({ email: "", password: "" });
const [msg, setMsg] = useState("");
const handleSubmit = async (e: any) => {
e.preventDefault();
const res = await fetch("http://localhost:5000/auth/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(form),
});
const data = await res.json();
if (data.token) {
login(data.user, data.token);
setMsg("Login successful 🎉");
} else {
setMsg(data.error);
}
};
return (
<div className="flex flex-col items-center justify-center min-h-screen">
<h1 className="text-2xl font-bold mb-4">Login</h1>
<form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
<input
className="p-2 border"
placeholder="Email"
onChange={(e) => setForm({ ...form, email: e.target.value })}
/>
<input
type="password"
className="p-2 border"
placeholder="Password"
onChange={(e) => setForm({ ...form, password: e.target.value })}
/>
<button className="bg-green-600 text-white p-2">Login</button>
</form>
{msg && <p className="mt-2">{msg}</p>}
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
const res = await fetch("http://localhost:5000/auth/register", {
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
<input className="p-2 border" placeholder="Name"
onChange={e => setForm({ ...form, name: e.target.value })} />
<input className="p-2 border" placeholder="Email"
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

APP\dangler-frontend\src\app\globals.css:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

APP\dangler-frontend\src\app\layout.tsx:
```typescript
import { AuthProvider } from "../context/AuthContext";
export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body>
<AuthProvider>{children}</AuthProvider>
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

APP\dangler-frontend\src\context\AuthContext.tsx:
```typescript
import { createContext, useState, useContext, useEffect } from "react";
const AuthContext = createContext<any>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
const [user, setUser] = useState<any>(null);
const [token, setToken] = useState<string | null>(null);
useEffect(() => {
const saved = localStorage.getItem("token");
if (saved) {
setToken(saved);
// Optionally fetch user info with token
}
}, []);
const login = (userData: any, jwt: string) => {
setUser(userData);
setToken(jwt);
localStorage.setItem("token", jwt);
};
const logout = () => {
setUser(null);
setToken(null);
localStorage.removeItem("token");
};
return (
<AuthContext.Provider value={{ user, token, login, logout }}>
{children}
</AuthContext.Provider>
);
}
export function useAuth() {
return useContext(AuthContext);
}
```

APP\dangler-frontend\tailwind.config.js:
```js
module.exports = {
content: [
"./src/app*.{js,ts,jsx,tsx}",
"./src/components*.{js,ts,jsx,tsx}"
],
theme: {
extend: {},
},
plugins: [],
}
```

