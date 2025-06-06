const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ruta de destino
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'water-sources');

// Asegurarse de que el directorio existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configuración del almacenamiento en disco para los archivos subidos.
 * Define la ruta de destino y el nombre de archivo generado de forma única.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitizar el nombre original del archivo
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`;
    cb(null, uniqueName);
  }
});

/**
 * Filtro personalizado para aceptar solo ciertos tipos y extensiones de imagen.
 * 
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {Express.Multer.File} file - Archivo a evaluar.
 * @param {function} cb - Callback para aceptar o rechazar el archivo.
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, JPEG, PNG o WEBP'), false);
  }
};

/**
 * Middleware Multer para gestionar la subida de imágenes.
 * - Límite de tamaño: 5MB
 * - Máximo 1 archivo por solicitud
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1
  }
});

module.exports = upload;
