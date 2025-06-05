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

const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

module.exports = uploadProfilePicture;
