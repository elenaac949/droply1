// middlewares/multerProfilePicture.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ruta para fotos de perfil
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profile-pictures');

// Asegurarse de que la carpeta existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configuración del almacenamiento para guardar fotos de perfil en disco.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`;
    cb(null, uniqueName);
  }
});

/**
 * Filtro para permitir solo imágenes válidas (JPG, JPEG, PNG, WEBP).
 * 
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {Express.Multer.File} file - Archivo subido.
 * @param {Function} cb - Callback que acepta o rechaza el archivo.
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
 * Middleware para subir una única imagen de perfil bajo el campo `photo`.
 * 
 * - Tamaño máximo: 5 MB
 * - Solo se permite 1 archivo
 */
const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

module.exports = uploadProfilePicture.single('photo');
