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
