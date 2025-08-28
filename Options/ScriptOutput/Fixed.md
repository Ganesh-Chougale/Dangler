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