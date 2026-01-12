-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 29, 2025 at 03:51 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `leads-dashboard`
--

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `customer` varchar(255) NOT NULL,
  `column_id` int NOT NULL,
  `description` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `title`, `customer`, `column_id`, `description`, `created_by`, `created_at`, `updated_at`) VALUES
(32, 'Bierseke', 'Jacko Meijaard', 35, 'Bier bedrijf waar wij mogelijk nieuwe bierflesjes designs mogen maken', NULL, '2025-12-16 15:10:56', '2025-12-29 15:49:46'),
(33, 'Test', 'test', 35, 'test', 5, '2025-12-29 15:50:36', '2025-12-29 15:50:36');

-- --------------------------------------------------------

--
-- Table structure for table `lead_columns`
--

CREATE TABLE `lead_columns` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `position` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lead_columns`
--

INSERT INTO `lead_columns` (`id`, `name`, `position`) VALUES
(35, 'Nieuwe Leads', 1),
(36, 'Eerste Contact Gelegd', 2),
(37, 'Gekwalificeerd', 3),
(38, 'Inventarisatie / Intake', 4),
(39, 'Offerte Verzonden', 5),
(40, 'Onderhandeling / Besluitvorming', 6),
(41, 'Gewonnen (Deal gesloten)', 7);

-- --------------------------------------------------------

--
-- Table structure for table `lead_history`
--

CREATE TABLE `lead_history` (
  `id` int NOT NULL,
  `lead_id` int NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lead_history`
--

INSERT INTO `lead_history` (`id`, `lead_id`, `action`, `user_id`, `created_at`) VALUES
(239, 32, 'Lead created', NULL, '2025-12-16 15:10:56'),
(240, 32, 'Moved to column \"Eerste Contact Gelegd\"', NULL, '2025-12-16 15:10:57'),
(241, 32, 'Moved to column \"Gekwalificeerd\"', NULL, '2025-12-16 15:29:32'),
(242, 32, 'Moved to column \"Eerste Contact Gelegd\"', NULL, '2025-12-16 15:29:35'),
(243, 32, 'Moved to column \"Gekwalificeerd\"', NULL, '2025-12-16 15:41:40'),
(244, 32, 'Moved to column \"Eerste Contact Gelegd\"', NULL, '2025-12-16 15:41:41'),
(245, 32, 'Verplaatst naar kolom \"Nieuwe Leads\"', 5, '2025-12-29 15:49:46'),
(246, 33, 'Lead aangemaakt', 5, '2025-12-29 15:50:36');

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int NOT NULL,
  `lead_id` int NOT NULL,
  `content` text NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`id`, `lead_id`, `content`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 33, 'test', 5, '2025-12-29 15:50:41', '2025-12-29 15:50:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `created_at`) VALUES
(3, 'b.kouwenberg@imaginecreativeagency.nl', '$2y$10$jWCXcuZzpUXnoWlqLwFbSelBxT3tLu1soKEXFIwHaettzeXA6g4L6', 'Britt Kouwenberg', '2025-12-29 15:46:44'),
(4, 'b.steffen@imaginecreativeagency.nl', '$2y$10$ZyUzeqrGjvFSOc9dKcK0u.d8TkLeQsRcWVd1mlZZ0Batdk1FXjo7i', 'Ben Steffen', '2025-12-29 15:47:12'),
(5, 'test@example.com', '$2y$10$JdCjOCm9Ygo0wCRX3t6F8.u9MPL30vxrR7mxC9CUiWr3bYwWIyVri', 'test', '2025-12-29 15:47:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `column_id` (`column_id`);

--
-- Indexes for table `lead_columns`
--
ALTER TABLE `lead_columns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lead_history`
--
ALTER TABLE `lead_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_id` (`lead_id`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_id` (`lead_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `lead_columns`
--
ALTER TABLE `lead_columns`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

-- --------------------------------------------------------
--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL UNIQUE,
  `color` varchar(7) DEFAULT '#6366f1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
--
-- Table structure for table `lead_tags`
--

CREATE TABLE `lead_tags` (
  `id` int NOT NULL,
  `lead_id` int NOT NULL,
  `tag_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- AUTO_INCREMENT for table `lead_history`
--
ALTER TABLE `lead_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=247;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_tags`
--
ALTER TABLE `lead_tags`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `leads_ibfk_1` FOREIGN KEY (`column_id`) REFERENCES `lead_columns` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_history`
--
ALTER TABLE `lead_history`
  ADD CONSTRAINT `lead_history_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_tags`
--
ALTER TABLE `lead_tags`
  ADD CONSTRAINT `lead_tags_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lead_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Add unique constraint to prevent duplicate tag assignments
--
ALTER TABLE `lead_tags` ADD UNIQUE KEY `unique_lead_tag` (`lead_id`, `tag_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
