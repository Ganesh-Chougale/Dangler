# **Dangler – Phase 4 Documentation**

## **Phase 4: Backend API – CRUD for Entries & Events**

### **Objective**

* Implement full **CRUD APIs** for **Individuals (entries)** and **Events ("knots")**.
* Enable frontend to **create, read, update, delete** entries & events.
* Ensure **nested retrieval** of events and tags for individuals.
* Add **input validation** and **error handling**.

---

## **1️⃣ Database Schema Reminder**

We already had these tables from Phase 3:

### **1.1 Individuals**

```sql
CREATE TABLE individuals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('real','fictional','mythological','obscure') NOT NULL,
    sub_category VARCHAR(100),
    description TEXT,
    birth_date DATE,
    death_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **1.2 Events**

```sql
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    individual_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    media_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (individual_id) REFERENCES individuals(id) ON DELETE CASCADE
);
```

### **1.3 Tags and Individual\_Tags**

* **Tags table** stores roles, themes, regions, etc.
* **individual\_tags** creates M\:N relation between individuals and tags.

---

## **2️⃣ Backend Route Implementation**

### **2.1 Individuals CRUD**

**File:** `routes/individuals.js`

* **GET `/individuals`** → List all individuals
* **GET `/individuals/:id`** → Fetch individual with nested events & tags
* **POST `/individuals`** → Create new individual with events & tags
* **PUT `/individuals/:id`** → Update individual
* **DELETE `/individuals/:id`** → Delete individual (cascade deletes events)

**Features**

* Input validation: `name`, `category`, `birth_date` required
* Error handling: 400 / 404 / 500
* Nested fetch: events sorted by `event_date`, tags via M\:N relation
* Bulk insert of events & tags on creation

---

### **2.2 Events CRUD**

**File:** `routes/events.js`

* **GET `/events`** → List all events
* **GET `/events/:id`** → Fetch single event
* **POST `/events`** → Create event for an individual
* **PUT `/events/:id`** → Update event
* **DELETE `/events/:id`** → Delete event

**Features**

* Input validation: `individual_id`, `title`, `event_date` required
* Error handling: 400 / 404 / 500
* Event is linked to individual via `individual_id`
* Supports optional `description` & `media_url`

---

### **2.3 Backend Entry Point**

**File:** `index.js`

```js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import individualsRoutes from "./routes/individuals.js";
import eventsRoutes from "./routes/events.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/individuals", individualsRoutes);
app.use("/events", eventsRoutes);

app.get("/test-db", async (req, res) => {
  res.json({ message: "Backend working" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
```

---

## **3️⃣ Input Validation & Error Handling**

| Route                         | Validation                             | Errors Returned    |
| ----------------------------- | -------------------------------------- | ------------------ |
| POST /individuals             | `name`, `category`, `birth_date`       | 400 Missing fields |
| PUT /individuals/\:id         | Optional fields checked                | 404 Not found      |
| POST /events                  | `individual_id`, `title`, `event_date` | 400 Missing fields |
| GET/PUT/DELETE (non-existent) | ID exists                              | 404 Not found      |
| Any unexpected DB error       | N/A                                    | 500 Server error   |

---

## **4️⃣ Sample Requests & Responses**

### **4.1 Individuals**

* **GET `/individuals`**

```json
[
  {
    "id":1,"name":"Michael Jackson","category":"real","sub_category":null,
    "description":"King of Pop, famous singer and dancer.",
    "birth_date":"1958-08-28T18:30:00.000Z",
    "death_date":"2009-06-24T18:30:00.000Z"
  },
  ...
]
```

* **GET `/individuals/1`**

```json
{
  "individual": { "id":1, "name":"Michael Jackson", ... },
  "events":[ { "id":1, "title":"First Song Release", "event_date":"1967-07-12T18:30:00.000Z" }, ... ],
  "tags":[ { "id":1, "name":"Singer", "type":"role" }, ... ]
}
```

* **POST `/individuals`**

```json
{
  "name": "Elon Musk",
  "category": "real",
  "description": "Entrepreneur, founder of SpaceX & Tesla",
  "birth_date": "1971-06-28",
  "events": [
    { "title": "Founded Tesla", "event_date": "2003-07-01" },
    { "title": "Founded SpaceX", "event_date": "2002-03-14" }
  ],
  "tags": [2,4]
}
```

Response:

```json
{ "message": "Individual created successfully", "id": 4 }
```

* **PUT `/individuals/4`** → Update description, category, or dates
* **DELETE `/individuals/4`** → Deletes individual + events cascade

---

### **4.2 Events**

* **POST `/events`**

```json
{
  "individual_id": 1,
  "title": "New Album Release",
  "description": "Released a new album.",
  "event_date": "1982-11-30",
  "media_url": null
}
```

Response:

```json
{ "message": "Event created", "id": 6 }
```

* **PUT `/events/6`** → Update title/description/media
* **DELETE `/events/6`** → Delete event

---

## **5️⃣ Testing Flow (Postman / API Client)**

1. GET `/individuals` → Verify seeded data
2. GET `/individuals/:id` → Check nested events & tags
3. POST new individual → Verify creation & nested events/tags
4. PUT update individual → Verify updated fields
5. DELETE individual → Check cascade deletion of events
6. Repeat same for `/events` CRUD

**Status:** ✅ All endpoints tested successfully in Postman.

---

## **6️⃣ Notes / Key Points**

* Input validation ensures no incomplete or broken entries.
* Nested GET `/individuals/:id` is crucial for **rope/timeline visualization** in Phase 5.
* Full CRUD ensures the backend is **ready for frontend integration**.
* Cascading deletion prevents orphaned events.
* Backend is **modularized**: separate routes for `auth`, `individuals`, `events`.

---

This documentation now **fully captures Phase 4**: implementation, routes, validation, error handling, and testing.