-- Database schema for backend Sequelize models
-- Run this in MySQL to create the tables used by the application.

DROP DATABASE IF EXISTS `tms`;
CREATE DATABASE IF NOT EXISTS `tms` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tms`;

DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','staff','student') NOT NULL DEFAULT 'student',
  `department` VARCHAR(255) NOT NULL DEFAULT 'Computer Science',
  `supervisorId` INT UNSIGNED NULL,
  `phone` VARCHAR(255) NOT NULL DEFAULT '',
  `status` VARCHAR(255) NOT NULL DEFAULT 'Active',
  `avatar` VARCHAR(255) NOT NULL DEFAULT '',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `users_supervisorId_idx` (`supervisorId`),
  CONSTRAINT `users_supervisorId_fk` FOREIGN KEY (`supervisorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tasks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(255) NOT NULL DEFAULT 'Subject Assignment',
  `priority` VARCHAR(255) NOT NULL DEFAULT 'Medium',
  `deadline` VARCHAR(255) NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'Pending',
  `createdBy` INT UNSIGNED NOT NULL,
  `assignedTo` INT UNSIGNED NOT NULL,
  `assignedToName` VARCHAR(255) NOT NULL DEFAULT '',
  `assignedToRole` VARCHAR(255) NOT NULL DEFAULT 'student',
  `reminderSent` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tasks_createdBy_idx` (`createdBy`),
  KEY `tasks_assignedTo_idx` (`assignedTo`),
  CONSTRAINT `tasks_createdBy_fk` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tasks_assignedTo_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `type` VARCHAR(255) NOT NULL DEFAULT 'Task Assigned',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_userId_idx` (`userId`),
  CONSTRAINT `notifications_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;