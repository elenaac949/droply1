
-- Crear tabla users
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Crear tabla water_sources
CREATE TABLE water_sources (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    created_by CHAR(36),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_water_source_user FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL
);

-- Crear tabla reviews
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    water_source_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_review_water_source FOREIGN KEY (water_source_id) REFERENCES water_sources(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Crear tabla photos
CREATE TABLE photos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    water_source_id CHAR(36),
    review_id CHAR(36),
    user_id CHAR(36) NOT NULL,
    url VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_photo_water_source FOREIGN KEY (water_source_id) REFERENCES water_sources(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_photo_review FOREIGN KEY (review_id) REFERENCES reviews(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_photo_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    
    -- Validación: solo puede tener asociado water_source_id o review_id (no ambos)
    CONSTRAINT chk_photo_target CHECK (
        (water_source_id IS NOT NULL AND review_id IS NULL)
        OR (water_source_id IS NULL AND review_id IS NOT NULL)
    )
);


