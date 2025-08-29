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
   `role` enum('user','admin') NOT NULL DEFAULT 'user',
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
### event_tags  
```sql
CREATE TABLE event_tags (
  event_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (event_id, tag_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
``` 
### tag_moderation  
```sql
CREATE TABLE tag_moderation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag_id INT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reported_by INT DEFAULT NULL,
  reviewed_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
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