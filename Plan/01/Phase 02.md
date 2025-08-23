# 📘 Phase 2: User Authentication (Completed)

## 2.1 Create `users` table in MySQL

We added a `users` table to store registered users.

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2.2 Implement Registration & Login APIs

📂 **File:** `APP/dangler-backend/routes/auth.js`

* `/auth/register` → Creates new user with hashed password.
* `/auth/login` → Validates credentials, issues JWT token (1h expiry).

---

## 2.3 Add Password Hashing (bcrypt)

📦 Installed `bcryptjs` → `npm install bcryptjs`

* Passwords are **hashed** with `bcrypt.hash(password, 10)`.
* Stored only hashed passwords in DB.
* Login uses `bcrypt.compare` to validate.

---

## 2.4 Implement JWT Authentication

📦 Installed `jsonwebtoken` → `npm install jsonwebtoken`

* On login, backend signs JWT:

```js
jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" })
```

* Stored `JWT_SECRET` securely in `.env`.
* Token is required in `Authorization: Bearer <token>` header for protected routes.

---

## 2.5 Middleware for Auth

📂 **File:** `APP/dangler-backend/middleware/auth.js`

* Validates JWT from request headers.
* If valid → attaches `req.user`.
* If invalid/missing → returns `401 Unauthorized`.

---

## 2.6 Protected Route

📂 **File:** `APP/dangler-backend/index.js`

```js
app.get("/protected", authenticate, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, this is protected` });
});
```

---

## 2.7 Environment Variables

📂 **File:** `.env`

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=root
DB_NAME=dangler
JWT_SECRET=<strong_random_secret>
```

---

## 2.8 Testing with Postman

1. **Register user** → `POST /auth/register`

```json
{ "name": "Ganesh", "email": "ganesh@example.com", "password": "123456" }
```

✅ Response: `{ "message": "User registered successfully" }`

2. **Login user** → `POST /auth/login`
   ✅ Response: `{ "token": "<jwt_token>", "user": { "id": 1, "name": "Ganesh", "email": "ganesh@example.com" } }`

3. **Access protected route** → `GET /protected` with Header:
   `Authorization: Bearer <jwt_token>`
   ✅ Response: `{ "message": "Welcome ganesh@example.com, this is protected" }`

---

# ✅ Phase 2 Complete

* Database connected to users table.
* Secure password storage (bcrypt).
* JWT-based authentication implemented.
* Auth middleware enforces security.
* Fully tested with Postman.