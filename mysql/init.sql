-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS droply CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE droply;

-- Eliminar tablas en orden inverso de dependencia
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS water_sources;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT NULL,
    country VARCHAR(100) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    postal_code VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS water_sources (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    type ENUM('drinking', 'tap', 'decorative', 'bottle_refill', 'natural_spring', 'other') DEFAULT 'other',
    is_accessible BOOLEAN DEFAULT FALSE,
    schedule VARCHAR(100),
    user_id CHAR(36) DEFAULT '00000000-0000-0000-0000-000000000000',
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    country VARCHAR(100) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    postal_code VARCHAR(20) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    is_osm BOOLEAN DEFAULT FALSE,
    osm_id BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (latitude, longitude),
    INDEX idx_status (status),
    UNIQUE INDEX idx_osm_id (osm_id),
    CONSTRAINT fk_water_source_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    water_source_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
    INDEX idx_review_source_status (water_source_id, status),
    INDEX idx_user (user_id),
    CONSTRAINT fk_review_water_source 
        FOREIGN KEY (water_source_id) REFERENCES water_sources(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_review_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS photos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    water_source_id CHAR(36),
    review_id CHAR(36),
    user_id CHAR(36) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    file_url VARCHAR(512) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    width INT,
    height INT,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderated_at TIMESTAMP NULL,
    moderated_by CHAR(36),
    INDEX idx_photo_user (user_id),
    INDEX idx_photo_status (status),
    INDEX idx_photo_hash (file_hash),
    INDEX idx_photo_source (water_source_id),
    INDEX idx_photo_review (review_id),
    CONSTRAINT chk_photo_target CHECK (
        (water_source_id IS NOT NULL AND review_id IS NULL) OR
        (water_source_id IS NULL AND review_id IS NOT NULL)
    ),
    CONSTRAINT fk_photo_water_source 
        FOREIGN KEY (water_source_id) REFERENCES water_sources(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_photo_review 
        FOREIGN KEY (review_id) REFERENCES reviews(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_photo_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_photo_moderator 
        FOREIGN KEY (moderated_by) REFERENCES users(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🧪 DATOS DE PRUEBA 
-- ============================================

-- 👤 USUARIOS DE PRUEBA
-- CREDENCIALES ANTES DEL HASH:
-- admin@droply.com - Contraseña: admin123
-- maria.garcia@email.com - Contraseña: maria123  
-- carlos.lopez@email.com - Contraseña: carlos123
-- ana.martinez@email.com - Contraseña: ana123
-- pedro.sanchez@email.com - Contraseña: pedro123

INSERT INTO users (id, username, email, phone, country, city, postal_code, address, password, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@droply.com', '+34600123456', 'España', 'Madrid', '28001', 'Calle Mayor, 1', '$2a$10$X.Z2K4h0/nYXzZjYv7r2hO3wELWXWzAkwMBZPW2qqMWEhBJ5Xc8S6', 'admin'),
('550e8400-e29b-41d4-a716-446655440001', 'maria_garcia', 'maria.garcia@email.com', '+34610123456', 'España', 'Madrid', '28010', 'Calle Serrano, 45', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('550e8400-e29b-41d4-a716-446655440002', 'carlos_lopez', 'carlos.lopez@email.com', '+34620123456', 'España', 'Barcelona', '08001', 'Passeig de Gràcia, 23', '$2a$10$HKQ1tXdR7.45zZ1FQcr8LeYvg9nE5XQFcLM.6y7vBXgRvEowCXi5e', 'user'),
('550e8400-e29b-41d4-a716-446655440003', 'ana_martinez', 'ana.martinez@email.com', '+34630123456', 'España', 'Valencia', '46001', 'Calle Colón, 12', '$2a$10$k5YYlPbQ8hEQGWFz9gG2ZOKvXrK0vLvG2YNNrYz4VbkWsVLrO4HnK', 'user'),
('550e8400-e29b-41d4-a716-446655440004', 'pedro_sanchez', 'pedro.sanchez@email.com', '+34640123456', 'España', 'Sevilla', '41001', 'Calle Sierpes, 34', '$2a$10$rRyQ8N7XcKk5F4wGz1jZVeFUiV4yY7P5qM6T2zOxWsKzPvL9JbNMi', 'user');

-- 💧 FUENTES DE AGUA DE PRUEBA (Madrid, Barcelona, Valencia, Sevilla)
INSERT INTO water_sources (id, name, description, latitude, longitude, type, is_accessible, schedule, user_id, status, country, city, postal_code, address) VALUES
-- Madrid
('660e8400-e29b-41d4-a716-446655440000', 'Fuente de Cibeles', 'Icónica fuente en el centro de Madrid, agua potable disponible', 40.41928600, -3.69310100, 'drinking', TRUE, '24/7', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'España', 'Madrid', '28014', 'Plaza de Cibeles'),
('660e8400-e29b-41d4-a716-446655440001', 'Fuente del Parque del Retiro', 'Fuente histórica en el parque, perfecta para rellenar botellas', 40.41513800, -3.68434500, 'bottle_refill', TRUE, '06:00-24:00', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'España', 'Madrid', '28009', 'Parque del Buen Retiro'),
('660e8400-e29b-41d4-a716-446655440002', 'Fuente Plaza Mayor', 'Fuente moderna con agua filtrada en el centro histórico', 40.41556400, -3.70765600, 'tap', TRUE, '24/7', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'España', 'Madrid', '28012', 'Plaza Mayor'),


-- Fuentes pendientes de aprobación
('660e8400-e29b-41d4-a716-446655440009', 'Nueva Fuente Malasaña', 'Fuente reportada recientemente, pendiente de verificación', 40.42776700, -3.70379200, 'other', FALSE, 'Desconocido', '550e8400-e29b-41d4-a716-446655440001', 'pending', 'España', 'Madrid', '28004', 'Barrio de Malasaña');

-- 🌟 RESEÑAS DE PRUEBA
INSERT INTO reviews (id, water_source_id, user_id, rating, comment, status, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 5, 'Excelente fuente, agua muy fresca y siempre funciona. Ubicación perfecta en el centro.', 'approved', '2024-01-15 10:30:00'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 4, 'Muy buena fuente, aunque a veces hay mucha gente. El agua tiene buen sabor.', 'approved', '2024-01-20 14:45:00'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 5, 'Perfecta para llenar la botella durante mi running matutino. Muy limpia y accesible.', 'approved', '2024-01-25 08:15:00'),
-- Reseña pendiente de moderación
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 4, 'Fuente muy conveniente, está en pleno centro y el agua está rica.', 'pending', '2024-02-20 11:15:00');


-- Otorgar permisos al usuario de desarrollo
GRANT ALL PRIVILEGES ON droply.* TO 'devuser'@'%';
FLUSH PRIVILEGES;

-- Mensaje de confirmación
SELECT 'Base de datos Droply inicializada correctamente con datos de prueba' AS mensaje;