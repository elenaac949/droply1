-- Tabla users 
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email) /* indexado en email */
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Tabla water_sources mejorada
CREATE TABLE water_sources (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    type ENUM(
        'drinking',
        'tap',
        'decorative',
        'bottle_refill',
        'natural_spring',
        'other'
    ) DEFAULT 'other',
    is_accessible BOOLEAN DEFAULT FALSE,
    schedule VARCHAR(100),
    user_id CHAR(36) DEFAULT '00000000-0000-0000-0000-000000000000',
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_water_source_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL,
    
    INDEX idx_location (latitude, longitude),
    INDEX idx_status (status)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla reviews mejorada
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
        ON DELETE CASCADE,
    
    INDEX idx_review_source_status (water_source_id, status),
    INDEX idx_user (user_id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla photos mejorada
CREATE TABLE photos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Relaciones
    water_source_id CHAR(36),
    review_id CHAR(36),
    user_id CHAR(36) NOT NULL,
    
    -- Metadatos del archivo
    original_filename VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo',
    storage_path VARCHAR(512) NOT NULL COMMENT 'Ruta segura en el sistema de almacenamiento',
    file_url VARCHAR(512) NOT NULL COMMENT 'URL pública para acceder al archivo',
    mime_type VARCHAR(100) NOT NULL COMMENT 'Tipo MIME real del archivo',
    file_size INT NOT NULL COMMENT 'Tamaño en bytes',
    file_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 del contenido del archivo',
    
    -- Dimensiones para imágenes
    width INT,
    height INT,
    
    -- Metadatos de moderación
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderated_at TIMESTAMP NULL COMMENT 'Fecha de moderación',
    moderated_by CHAR(36) COMMENT 'ID del admin que moderó',
    
    -- Constraints
    CONSTRAINT fk_photo_water_source FOREIGN KEY (water_source_id) 
        REFERENCES water_sources(id) ON DELETE CASCADE,
    CONSTRAINT fk_photo_review FOREIGN KEY (review_id) 
        REFERENCES reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_photo_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_photo_moderator FOREIGN KEY (moderated_by) 
        REFERENCES users(id) ON DELETE SET NULL,
    
    -- Verificación de relación exclusiva
    CONSTRAINT chk_photo_target CHECK (
        (water_source_id IS NOT NULL AND review_id IS NULL) OR
        (water_source_id IS NULL AND review_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices adicionales (se crean después para evitar problemas)
CREATE INDEX idx_photo_user ON photos(user_id);
CREATE INDEX idx_photo_status ON photos(status);
CREATE INDEX idx_photo_hash ON photos(file_hash);
CREATE INDEX idx_photo_source ON photos(water_source_id);
CREATE INDEX idx_photo_review ON photos(review_id);

/* Creación de usuarios */

INSERT INTO users (id, username, email, password, role) 
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'admin', 
  'admin@admin.com', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV8XJ7ZRyb7W0Fb3J4J6RT9Q0QzqK', 
  'admin'
);

-- Usuario 2: "juan" con contraseña "juan1234"
INSERT INTO users (id, username, email, password, role) 
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'juan', 
  'juan@example.com', 
  '$2a$10$V7Bz2.TZxJ.6qE9rY1qQ.OlYf6e3m3v4wWk5jH2s1nGt7pN8KsRtD',  -- juan1234
  'user'
);

-- Usuario 3: "maria" con contraseña "maria1234"
INSERT INTO users (id, username, email, password, role) 
VALUES (
  '22222222-2222-2222-2222-222222222222', 
  'maria', 
  'maria@example.com', 
  '$2a$10$Xp3L6kR9.Q2s1m4nV5wJ.uY7v8wLk9Xx3jK4m3l2hY1vN5sRt6Gq',  -- maria1234
  'user'
);
/* Fuentes de agua con UUIDs fijos */
-- 1. Fuente pública potable
INSERT INTO water_sources (
    id, 
    name, 
    description, 
    latitude, 
    longitude, 
    type, 
    is_accessible, 
    schedule, 
    user_id, 
    status
) VALUES (
    'aaaa1111-bbbb-2222-cccc-333333333333',  -- UUID fijo para esta fuente
    'Fuente de la Plaza del Pueblo', 
    'Fuente pública potable en el centro de Colmenar Viejo. Caño metálico con buen caudal.', 
    40.659057, 
    -3.767370, 
    'drinking', 
    TRUE, 
    'Siempre accesible', 
    '00000000-0000-0000-0000-000000000000', 
    'approved'
);

-- 2. Fuente ornamental
INSERT INTO water_sources (
    id, 
    name, 
    description, 
    latitude, 
    longitude, 
    type, 
    is_accessible, 
    schedule, 
    user_id, 
    status
) VALUES (
    'bbbb2222-cccc-3333-dddd-444444444444',  -- UUID fijo para esta fuente
    'Fuente de los Patos - Parque La Pradera', 
    'Gran fuente decorativa con estanque. Agua no potable. Ideal para descansar.', 
    40.661842, 
    -3.762915, 
    'decorative', 
    TRUE, 
    'Diario 8:00-22:00', 
    '11111111-1111-1111-1111-111111111111', 
    'approved'
);

-- 3. Punto de recarga
INSERT INTO water_sources (
    id, 
    name, 
    description, 
    latitude, 
    longitude, 
    type, 
    is_accessible, 
    schedule, 
    user_id, 
    status
) VALUES (
    'cccc3333-dddd-4444-eeee-555555555555',  -- UUID fijo para esta fuente
    'Punto de Recarga Eco - Biblioteca Municipal', 
    'Máquina moderna para rellenar botellas con agua filtrada y fría. Acceso para sillas de ruedas.', 
    40.657320, 
    -3.764890, 
    'bottle_refill', 
    TRUE, 
    'L-V 9:00-21:00, S 10:00-14:00', 
    '22222222-2222-2222-2222-222222222222', 
    'approved'
);

/* Valoraciones aprobadas */
-- 1. Valoraciones para Fuente de la Plaza del Pueblo (aaaa1111...)
INSERT INTO reviews (
    id,
    water_source_id,
    user_id,
    rating,
    comment,
    status,
    created_at
) VALUES 
(
    UUID(),
    'aaaa1111-bbbb-2222-cccc-333333333333',  -- Fuente Plaza
    '11111111-1111-1111-1111-111111111111',  -- juan
    5,
    'Agua fresquísima y buen caudal. Siempre que paso por el centro lleno mi botella aquí.',
    'approved',
    CURRENT_TIMESTAMP
),
(
    UUID(),
    'aaaa1111-bbbb-2222-cccc-333333333333',  -- Fuente Plaza
    '22222222-2222-2222-2222-222222222222',  -- maria
    4,
    'Muy buena fuente, pero a veces hay cola en verano. El agua sabe muy bien.',
    'approved',
    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY)
);

-- 2. Valoraciones para Fuente de los Patos (bbbb2222...)
INSERT INTO reviews (
    id,
    water_source_id,
    user_id,
    rating,
    comment,
    status,
    created_at
) VALUES 
(
    UUID(),
    'bbbb2222-cccc-3333-dddd-444444444444',  -- Fuente Patos
    '22222222-2222-2222-2222-222222222222',  -- maria
    5,
    'Preciosa fuente para sentarse a descansar. A mis hijos les encanta ver los patos.',
    'approved',
    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY)
),
(
    UUID(),
    'bbbb2222-cccc-3333-dddd-444444444444',  -- Fuente Patos
    '00000000-0000-0000-0000-000000000000',  -- admin
    3,
    'Bonita estéticamente pero el agua no es potable. Falta cartel informativo.',
    'approved',
    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 WEEK)
);