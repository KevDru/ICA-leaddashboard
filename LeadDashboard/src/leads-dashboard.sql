-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 29, 2025 at 09:05 AM
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
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Optional: seed an initial user (replace hash with a real hash if desired)
-- INSERT INTO `users` (`email`, `password_hash`, `name`) VALUES ('admin@example.com', '$2y$10$exampleexampleexampleexampleexampleexampleexampleexample', 'Admin');

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

INSERT INTO `leads` (`id`, `title`, `customer`, `column_id`, `description`, `created_at`, `updated_at`) VALUES
(32, 'Bierseke', 'Jacko Meijaard', 36, 'Bier bedrijf waar wij mogelijk nieuwe bierflesjes designs mogen maken', '2025-12-16 15:10:56', '2025-12-16 15:41:41');

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

INSERT INTO `lead_history` (`id`, `lead_id`, `action`, `created_at`) VALUES
(239, 32, 'Lead created', '2025-12-16 15:10:56'),
(240, 32, 'Moved to column \"Eerste Contact Gelegd\"', '2025-12-16 15:10:57'),
(241, 32, 'Moved to column \"Gekwalificeerd\"', '2025-12-16 15:29:32'),
(242, 32, 'Moved to column \"Eerste Contact Gelegd\"', '2025-12-16 15:29:35'),
(243, 32, 'Moved to column \"Gekwalificeerd\"', '2025-12-16 15:41:40'),
(244, 32, 'Moved to column \"Eerste Contact Gelegd\"', '2025-12-16 15:41:41');

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `lead_columns`
--
ALTER TABLE `lead_columns`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `lead_history`
--
ALTER TABLE `lead_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=245;

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
-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE IF NOT EXISTS `notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lead_id` int NOT NULL,
  `content` text NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lead_id` (`lead_id`),
  CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
