const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración del storage para Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'water-sources', // Carpeta donde se guardarán las imágenes
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Formatos permitidos
    transformation: [
      {
        width: 1200,
        height: 800,
        crop: 'limit', // No corta la imagen, solo la redimensiona si es más grande
        quality: 'auto:good', // Calidad automática optimizada
        fetch_format: 'auto' // Formato automático (WebP si es compatible)
      }
    ],
    // Generar nombre único para cada archivo
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      return `photo_${timestamp}_${randomString}`;
    },
  },
});

// Configuración de Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Verificar tipo de archivo
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
});

// Funciones utilitarias para Cloudinary
const cloudinaryUtils = {
  // Eliminar imagen de Cloudinary
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error al eliminar imagen de Cloudinary:', error);
      throw error;
    }
  },

  // Subir imagen desde buffer (útil para otras implementaciones)
  async uploadFromBuffer(buffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: 'water-sources',
        transformation: [
          {
            width: 1200,
            height: 800,
            crop: 'limit',
            quality: 'auto:good',
            fetch_format: 'auto'
          }
        ],
        ...options
      };

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });
  },

  // Obtener URL optimizada
  getOptimizedUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width: options.width || 800,
          height: options.height || 600,
          crop: options.crop || 'fill',
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      ]
    });
  },

  // Generar diferentes tamaños de la misma imagen
  getImageVariants(publicId) {
    return {
      thumbnail: cloudinary.url(publicId, {
        transformation: [{ width: 150, height: 150, crop: 'fill', quality: 'auto:good' }]
      }),
      small: cloudinary.url(publicId, {
        transformation: [{ width: 400, height: 300, crop: 'fill', quality: 'auto:good' }]
      }),
      medium: cloudinary.url(publicId, {
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto:good' }]
      }),
      large: cloudinary.url(publicId, {
        transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto:good' }]
      }),
      original: cloudinary.url(publicId, { quality: 'auto:good' })
    };
  }
};

module.exports = {
  cloudinary,
  upload,
  cloudinaryUtils
};