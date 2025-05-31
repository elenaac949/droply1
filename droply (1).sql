-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 31-05-2025 a las 23:12:26
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `droply`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `photos`
--

CREATE TABLE `photos` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `water_source_id` char(36) DEFAULT NULL,
  `review_id` char(36) DEFAULT NULL,
  `user_id` char(36) NOT NULL,
  `original_filename` varchar(255) NOT NULL COMMENT 'Nombre original del archivo',
  `storage_path` varchar(512) NOT NULL COMMENT 'Ruta segura en el sistema de almacenamiento',
  `file_url` varchar(512) NOT NULL COMMENT 'URL pública para acceder al archivo',
  `mime_type` varchar(100) NOT NULL COMMENT 'Tipo MIME real del archivo',
  `file_size` int(11) NOT NULL COMMENT 'Tamaño en bytes',
  `file_hash` varchar(64) NOT NULL COMMENT 'SHA-256 del contenido del archivo',
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `moderated_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha de moderación',
  `moderated_by` char(36) DEFAULT NULL COMMENT 'ID del admin que moderó'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reviews`
--

CREATE TABLE `reviews` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `water_source_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Volcado de datos para la tabla `reviews`
--

INSERT INTO `reviews` (`id`, `water_source_id`, `user_id`, `rating`, `comment`, `status`, `created_at`) VALUES
('2845dbe5-3e35-11f0-8e1c-a83b76296ff4', 'bbbb2222-cccc-3333-dddd-444444444444', '55d71274-3d74-11f0-8424-a83b76296ff4', 5, 'wqewqeqwe', 'approved', '2025-05-31 15:37:27'),
('38ff4bba-3da9-11f0-8424-a83b76296ff4', 'aaaa1111-bbbb-2222-cccc-333333333333', '55d71274-3d74-11f0-8424-a83b76296ff4', 2, 'sdjgf hj jhkj', 'rejected', '2025-05-30 22:55:46'),
('4abc8d1d-3e35-11f0-8e1c-a83b76296ff4', 'bbbb2222-cccc-3333-dddd-444444444444', '16ff34fc-3d74-11f0-8424-a83b76296ff4', 3, 'asdasdasdasdads', 'approved', '2025-05-31 15:38:25'),
('508b5b56-3daa-11f0-a523-a83b76296ff4', 'aaaa1111-bbbb-2222-cccc-333333333333', '55d71274-3d74-11f0-8424-a83b76296ff4', 3, 'zxghghjjghdfdggh', 'approved', '2025-05-30 23:03:35'),
('c9d740fc-3d73-11f0-8424-a83b76296ff4', 'aaaa1111-bbbb-2222-cccc-333333333333', '11111111-1111-1111-1111-111111111111', 5, 'Agua fresquísima y buen caudal. Siempre que paso por el centro lleno mi botella aquí.', 'approved', '2025-05-30 16:33:16'),
('c9d75e48-3d73-11f0-8424-a83b76296ff4', 'aaaa1111-bbbb-2222-cccc-333333333333', '22222222-2222-2222-2222-222222222222', 4, 'Muy buena fuente, pero a veces hay cola en verano. El agua sabe muy bien.', 'approved', '2025-05-28 16:33:16'),
('c9ddc842-3d73-11f0-8424-a83b76296ff4', 'bbbb2222-cccc-3333-dddd-444444444444', '22222222-2222-2222-2222-222222222222', 5, 'Preciosa fuente para sentarse a descansar. A mis hijos les encanta ver los patos.', 'approved', '2025-05-27 16:33:16'),
('f778c6ad-3e56-11f0-956a-a83b76296ff4', 'cccc3333-dddd-4444-eeee-555555555555', '55d71274-3d74-11f0-8424-a83b76296ff4', 5, 'dsfghjkjgfdghj', 'approved', '2025-05-31 19:39:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `phone`, `country`, `city`, `postal_code`, `address`, `profile_picture`, `password`, `role`, `created_at`, `updated_at`) VALUES
('11111111-1111-1111-1111-111111111111', 'juan', 'juan@example.com', NULL, NULL, NULL, NULL, NULL, NULL, '$2a$10$V7Bz2.TZxJ.6qE9rY1qQ.OlYf6e3m3v4wWk5jH2s1nGt7pN8KsRtD', 'user', '2025-05-30 16:33:16', '2025-05-30 16:33:16'),
('16ff34fc-3d74-11f0-8424-a83b76296ff4', 'ana', 'ana@ana.com', NULL, NULL, NULL, NULL, NULL, NULL, '$2b$12$faZ/nUucj1yiswwaJex0IeRFLIByuLeNqzA.2TLUmjIimlXIEw3f6', 'user', '2025-05-30 16:35:25', '2025-05-30 16:35:25'),
('22222222-2222-2222-2222-222222222222', 'maria', 'maria@example.com', NULL, NULL, NULL, NULL, NULL, NULL, '$2a$10$Xp3L6kR9.Q2s1m4nV5wJ.uY7v8wLk9Xx3jK4m3l2hY1vN5sRt6Gq', 'user', '2025-05-30 16:33:16', '2025-05-30 16:33:16'),
('24d7489f-3e55-11f0-956a-a83b76296ff4', 'b', 'b@gmail.com', '642829002', 'España', 'Colmenar Viejo', '28770', 'Calle del Cura\nNº 18, Portal 1 Bajo 3', '', '$2b$12$uFChhMItAAkySMHw.vH5n.ZB.qeajhUM7SZb8um4qE8QB5KF9n.sK', 'user', '2025-05-31 19:26:25', '2025-05-31 19:26:25'),
('55d71274-3d74-11f0-8424-a83b76296ff4', 'admin', 'admin@admin.com', '', 'España', 'Hoyo de Manzanares', '28240', 'Calle Sobrante\nUrbanización Vista Hermosa Portal 1 Bajo C', '', '$2b$12$0QBK/BGSt1/.VWkzkumSRe3WR9pXvMmLQxDaKKJUMriwamza7L..O', 'admin', '2025-05-30 16:37:11', '2025-05-31 20:15:21'),
('979fcb03-3e51-11f0-956a-a83b76296ff4', 'sadasd', 'elenanitodelbosque949@gmail.com', '642829002', 'España', 'Hoyo de Manzanares', '28240', 'Calle Sobrante\nUrbanización Vista Hermosa Portal 1 Bajo C', '', '$2b$10$1fDdxcF2mvcsMgsEZ1NEjekx5bqhspGnH4sUJ97AjsSXE58iskVay', 'user', '2025-05-31 19:01:00', '2025-05-31 19:01:00'),
('982aa889-3e02-11f0-8e1c-a83b76296ff4', 'elena1234', 'elenaalexandra949@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '$2b$10$GXABQabI1N/.JPpiR4.dDup08ZbF/7pC5TQQlyfSLgDShtcWgJ37O', 'user', '2025-05-31 09:35:31', '2025-05-31 09:35:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `water_sources`
--

CREATE TABLE `water_sources` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `type` enum('drinking','tap','decorative','bottle_refill','natural_spring','other') DEFAULT 'other',
  `is_accessible` tinyint(1) DEFAULT 0,
  `schedule` varchar(100) DEFAULT NULL,
  `user_id` char(36) DEFAULT '00000000-0000-0000-0000-000000000000',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_osm` tinyint(1) DEFAULT 0,
  `osm_id` bigint(20) DEFAULT NULL COMMENT 'ID de la fuente en OSM si es externa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `water_sources`
--

INSERT INTO `water_sources` (`id`, `name`, `description`, `latitude`, `longitude`, `type`, `is_accessible`, `schedule`, `user_id`, `status`, `created_at`, `updated_at`, `country`, `city`, `postal_code`, `address`, `is_osm`, `osm_id`) VALUES
('41c00e8e-3d98-11f0-8424-a83b76296ff4', 'adsadasdasa', 'asdasdasd', 40.12345600, -3.70712200, 'tap', 1, 'Ninguno', '16ff34fc-3d74-11f0-8424-a83b76296ff4', 'approved', '2025-05-30 20:54:19', '2025-05-31 19:39:39', 'España', 'Hoyo de Manzanares', '28240', 'Calle Sobrante', 0, NULL),
('aaaa1111-bbbb-2222-cccc-333333333333', 'Fuente de la Plaza del Pueblo', 'Fuente pública potable en el centro de Colmenar Viejo. Caño metálico con buen caudal.', 40.65905700, -3.76737000, 'drinking', 1, 'Siempre accesible', '55d71274-3d74-11f0-8424-a83b76296ff4', 'approved', '2025-05-30 16:33:16', '2025-05-31 19:39:40', NULL, NULL, NULL, NULL, 0, NULL),
('bbbb2222-cccc-3333-dddd-444444444444', 'Fuente de los Patos - Parque La Pradera', 'Gran fuente decorativa con estanque. Agua no potable. Ideal para descansar.', 40.66184200, -3.76291500, 'decorative', 1, 'Diario 8:00-22:00', '11111111-1111-1111-1111-111111111111', 'approved', '2025-05-30 16:33:16', '2025-05-30 16:33:16', NULL, NULL, NULL, NULL, 0, NULL),
('cccc3333-dddd-4444-eeee-555555555555', 'Punto de Recarga Eco - Biblioteca Municipal', 'Máquina moderna para rellenar botellas con agua filtrada y fría. Acceso para sillas de ruedas.', 40.65732000, -3.76489000, 'bottle_refill', 1, 'L-V 9:00-21:00, S 10:00-14:00', '22222222-2222-2222-2222-222222222222', 'approved', '2025-05-30 16:33:16', '2025-05-30 16:33:16', NULL, NULL, NULL, NULL, 0, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `photos`
--
ALTER TABLE `photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_photo_moderator` (`moderated_by`),
  ADD KEY `idx_photo_user` (`user_id`),
  ADD KEY `idx_photo_status` (`status`),
  ADD KEY `idx_photo_hash` (`file_hash`),
  ADD KEY `idx_photo_source` (`water_source_id`),
  ADD KEY `idx_photo_review` (`review_id`);

--
-- Indices de la tabla `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_review_source_status` (`water_source_id`,`status`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indices de la tabla `water_sources`
--
ALTER TABLE `water_sources`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_osm_id` (`osm_id`),
  ADD KEY `fk_water_source_user` (`user_id`),
  ADD KEY `idx_location` (`latitude`,`longitude`),
  ADD KEY `idx_status` (`status`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `photos`
--
ALTER TABLE `photos`
  ADD CONSTRAINT `fk_photo_moderator` FOREIGN KEY (`moderated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_photo_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_photo_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_photo_water_source` FOREIGN KEY (`water_source_id`) REFERENCES `water_sources` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_review_water_source` FOREIGN KEY (`water_source_id`) REFERENCES `water_sources` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `water_sources`
--
ALTER TABLE `water_sources`
  ADD CONSTRAINT `fk_water_source_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
