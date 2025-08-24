# **Dangler – Phase 3 Documentation**

## **Phase 3: Basic Data Models & Seeding**

### **Objective**

* Implement core data models for Dangler: Individuals, Events, and Tags.
* Define relationships:

  * **Individual → Events (1\:N)**
  * **Individual → Tags (M\:N)**
* Seed dummy data for testing APIs.
* Verify backend APIs via Postman.

---

## **1. Database Schema**

### **1.1 Users Table** (Auth from Phase 2)

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **1.2 Individuals Table**

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

### **1.3 Events Table**

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

### **1.4 Tags Table**

```sql
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('role','region','theme','other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **1.5 Individual\_Tags Table**

```sql
CREATE TABLE individual_tags (
    individual_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (individual_id, tag_id),
    FOREIGN KEY (individual_id) REFERENCES individuals(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

---

## **2. Seed Data**

### **2.1 Individuals**

| ID | Name            | Category  | Sub-category | Description                            | Birth Date | Death Date |
| -- | --------------- | --------- | ------------ | -------------------------------------- | ---------- | ---------- |
| 1  | Michael Jackson | real      | NULL         | King of Pop, famous singer and dancer. | 1958-08-29 | 2009-06-25 |
| 2  | Heath Ledger    | real      | NULL         | Australian actor known for Joker role. | 1979-04-04 | 2008-01-22 |
| 3  | Harry Potter    | fictional | movie        | Wizard in J.K. Rowling series.         | 1980-07-31 | NULL       |

### **2.2 Events**

| Individual ID | Title                      | Description                         | Event Date |
| ------------- | -------------------------- | ----------------------------------- | ---------- |
| 1             | First Song Release         | Released first single as a child.   | 1967-07-13 |
| 1             | Married Lisa Marie Presley | Michael Jackson married Lisa Marie. | 1994-05-26 |
| 1             | Death                      | Michael Jackson passed away.        | 2009-06-25 |
| 2             | Oscars Nomination          | Nominated for Best Actor.           | 2006-01-22 |
| 2             | Death                      | Heath Ledger passed away.           | 2008-01-22 |
| 3             | First Book Release         | First Harry Potter book published.  | 1997-06-26 |

### **2.3 Tags**

| ID | Name   | Type  |
| -- | ------ | ----- |
| 1  | Singer | role  |
| 2  | Actor  | role  |
| 3  | Wizard | role  |
| 4  | Pop    | theme |
| 5  | Movie  | theme |

### **2.4 Individual\_Tags**

| Individual ID | Tag ID |
| ------------- | ------ |
| 1             | 1      |
| 1             | 4      |
| 2             | 2      |
| 2             | 5      |
| 3             | 3      |
| 3             | 5      |

---

## **3. Backend API Endpoints**

### **3.1 Get all individuals**

```
GET /individuals
Response: 200 OK
[
  { id, name, category, sub_category, description, birth_date, death_date, created_at }, ...
]
```

### **3.2 Get individual by ID (with events & tags)**

```
GET /individuals/:id
Response: 200 OK
{
  individual: { id, name, category, sub_category, description, birth_date, death_date, created_at },
  events: [ { id, individual_id, title, description, event_date, media_url, created_at }, ... ],
  tags: [ { id, name, type }, ... ]
}
```

### **3.3 Create new individual**

```
POST /individuals
Request Body (JSON):
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
Response: 201 Created
{ "message": "Individual created successfully", "id": 4 }
```

---

## **4. Testing**

* Use **Postman** to test endpoints.
* Verify data integrity:

  * GET `/individuals` → lists all individuals
  * GET `/individuals/:id` → returns correct events & tags
  * POST `/individuals` → creates new individual with events & tags

---

## **5. Notes**

* Dates in API responses are in **ISO format** (UTC).
* Events are ordered by `event_date ASC`.
* Tags are fetched via **M\:N relationship** from `individual_tags`.
* This phase forms the **foundation for frontend rope/timeline visualization** in Phase 5.
