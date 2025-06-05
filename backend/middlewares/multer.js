const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ruta de destino
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'water-sources');

// Asegurarse de que el directorio existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración del almacenamiento
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

// Filtro mejorado con validación adicional
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

// Middleware exportado con configuración mejorada
const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1 // Solo un archivo por request
  }
});

module.exports = upload;