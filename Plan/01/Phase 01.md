# 📘 Dangler — Phase 1: Core Setup & Skeleton

## 🎯 Goal

Lay down the foundation for both frontend and backend so they run independently and are ready to be connected in later phases.

---

## 1. Project Structure

```
APP/
│
├── dangler-frontend/   # Next.js 15 + TailwindCSS
│   └── src/app/        # App Router pages
│
└── dangler-backend/    # Node.js + Express + MySQL
```

---

## 2. Backend Setup (dangler-backend)

### 2.1 Initialize Project

```bash
mkdir dangler-backend && cd dangler-backend
npm init -y
npm install express cors mysql2 dotenv
```

Update `package.json` to support ES Modules:

```json
{
  "type": "module"
}
```

### 2.2 Environment Variables

Created `.env` file:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=root
DB_NAME=dangler
JWT_SECRET=secret_key_here
```
generate secret key with this command  
```bash
$ node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```  

### 2.3 Database

1. Logged into MySQL:

   ```bash
   mysql -u root -p
   ```
2. Created project DB:

   ```sql
   CREATE DATABASE dangler;
   SHOW DATABASES;
   ```

### 2.4 Database Utility (`db.js`)

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

### 2.5 Express Server (`index.js`)

```js
import express from "express";
import cors from "cors";
import { getDB } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/test-db", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT NOW() AS now");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

### 2.6 Verification

Start backend:

```bash
node index.js
```

Test in browser:

```
http://localhost:5000/test-db
```

✅ Response:

```json
[{"now":"2025-08-23T15:08:18.000Z"}]
```

---

## 3. Frontend Setup (dangler-frontend)

### 3.1 Initialize Project

```bash
npx create-next-app@latest dangler-frontend
```

Chose: **App Router + TypeScript + TailwindCSS**.

### 3.2 ESLint Config (`eslint.config.mjs`)

Used `FlatCompat` to extend Next.js rules.

### 3.3 Tailwind Config (`tailwind.config.js`)

```js
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3.4 Global Styles (`globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3.5 Root Layout (`layout.tsx`)

Included Google Geist fonts + Tailwind classes.

### 3.6 Home Page (`page.tsx`)

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">Hello Dangler 👋</h1>
      <p className="mt-2 text-gray-700">Frontend is working with Tailwind ✅</p>
    </main>
  );
}
```

### 3.7 Verification

Run frontend:

```bash
npm run dev
```

Open browser:

```
http://localhost:3000
```

✅ Output:

```
Hello Dangler 👋
Frontend is working with Tailwind ✅
```

---

## 4. ✅ Phase 1 Achievements

* ✔️ Project structure (frontend + backend)
* ✔️ MySQL DB created (`dangler`)
* ✔️ Backend Express server with working `/test-db` endpoint
* ✔️ Frontend Next.js + Tailwind boilerplate running
* ✔️ Both verified independently

---

## 📌 Next Steps (Phase 2 Preview)

* Define **database schema** (users, posts, comparisons, tags).
* Add **Prisma ORM** (optional, easier migrations).
* Create first **API routes** for CRUD (e.g., `users`).
* Fetch & display data in Next.js frontend.

---