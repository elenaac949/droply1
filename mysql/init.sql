-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS droply CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Usar la base de datos
USE droply;

DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS water_sources;
DROP TABLE IF EXISTS users;
-- 1. Primero crear la tabla users (no tiene dependencias)
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

-- 2. Crear water_sources (depende de users)
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
    UNIQUE INDEX idx_osm_id (osm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Primero crear la tabla sin la FK para evitar problemas
-- Luego añadir la FK con ALTER TABLE
ALTER TABLE water_sources ADD CONSTRAINT fk_water_source_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Crear reviews (depende de users y water_sources)
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
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Añadir FKs después de crear la tabla
ALTER TABLE reviews ADD CONSTRAINT fk_review_water_source 
FOREIGN KEY (water_source_id) REFERENCES water_sources(id) ON DELETE CASCADE;

ALTER TABLE reviews ADD CONSTRAINT fk_review_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Finalmente crear photos (depende de todas las anteriores)
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
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Añadir FKs después de crear la tabla
ALTER TABLE photos ADD CONSTRAINT fk_photo_water_source 
FOREIGN KEY (water_source_id) REFERENCES water_sources(id) ON DELETE CASCADE;

ALTER TABLE photos ADD CONSTRAINT fk_photo_review 
FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE;

ALTER TABLE photos ADD CONSTRAINT fk_photo_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE photos ADD CONSTRAINT fk_photo_moderator 
FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL;