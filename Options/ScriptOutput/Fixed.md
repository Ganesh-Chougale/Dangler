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
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```  
### create Individuals Table  
```sql
CREATE TABLE individuals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('real','fictional','mythological','obscure') NOT NULL,
    sub_category VARCHAR(100), -- e.g., 'movie', 'show', 'game'
    description TEXT,
    birth_date DATE,
    death_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```  
### create Events Table  
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
### Create tag table  
```sql
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('role','region','theme','other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```  
### Individual_Tags Table (M:N relation)  
```sql
CREATE TABLE individual_tags (
    individual_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (individual_id, tag_id),
    FOREIGN KEY (individual_id) REFERENCES individuals(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```  

## Sample seed data  
### Individuals  
```sql
INSERT INTO individuals (name, category, sub_category, description, birth_date, death_date)
VALUES 
('Michael Jackson', 'real', NULL, 'King of Pop, famous singer and dancer.', '1958-08-29', '2009-06-25'),
('Heath Ledger', 'real', NULL, 'Australian actor known for Joker role.', '1979-04-04', '2008-01-22'),
('Harry Potter', 'fictional', 'movie', 'Wizard in J.K. Rowling series.', '1980-07-31', NULL);
```  
### Events  
```sql
INSERT INTO events (individual_id, title, description, event_date, media_url)
VALUES
(1, 'First Song Release', 'Released first single as a child.', '1967-07-13', NULL),
(1, 'Married Lisa Marie Presley', 'Michael Jackson married Lisa Marie Presley.', '1994-05-26', NULL),
(1, 'Death', 'Michael Jackson passed away.', '2009-06-25', NULL),
(2, 'Oscars Nomination', 'Nominated for Best Actor.', '2006-01-22', NULL),
(2, 'Death', 'Heath Ledger passed away.', '2008-01-22', NULL),
(3, 'First Book Release', 'First Harry Potter book published.', '1997-06-26', NULL);
```  
### Tags  
```sql
INSERT INTO tags (name, type) VALUES 
('Singer', 'role'),
('Actor', 'role'),
('Wizard', 'role'),
('Pop', 'theme'),
('Movie', 'theme');
```  
### Individual_Tags  
```sql
INSERT INTO individual_tags (individual_id, tag_id) VALUES
(1, 1), -- Michael Jackson → Singer
(1, 4), -- Michael Jackson → Pop
(2, 2), -- Heath Ledger → Actor
(2, 5), -- Heath Ledger → Movie
(3, 3), -- Harry Potter → Wizard
(3, 5); -- Harry Potter → Movie
```  
## Testing  
- Test GET all individuals: SELECT * FROM individuals;
- Test GET individual + events:
```sql
SELECT i.*, e.* 
FROM individuals i
LEFT JOIN events e ON i.id = e.individual_id
WHERE i.name = 'Michael Jackson';
```  
- Test tags:  
```sql
SELECT i.name, t.name AS tag
FROM individuals i
JOIN individual_tags it ON i.id = it.individual_id
JOIN tags t ON t.id = it.tag_id;
```  