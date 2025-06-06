const Photo = require('../models/photoModel');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

/**
 * Controlador para la gestión de fotos subidas por los usuarios.
 * 
 * Incluye funcionalidades como subir, listar, filtrar y eliminar fotos,
 * ya sea por fuente de agua, por reseña o por usuario.
 */
class PhotoController {
  /**
   * Sube una nueva foto y la guarda en la base de datos.
   * 
   * @route POST /api/photos/upload
   * @param {import('express').Request} req - Solicitud con archivo subido y datos (user, fuente, reseña).
   * @param {import('express').Response} res - Respuesta con resultado de la operación.
   * @returns {void}
   */
  static async uploadPhoto(req, res) {
    try {
      const user_id = req.user.id;
      const { water_source_id, review_id } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha subido ningún archivo'
        });
      }

      const storagePath = `/uploads/water-sources/${req.file.filename}`;

      const newPhoto = {
        user_id,
        water_source_id: water_source_id || null,
        review_id: review_id || null,
        url: storagePath
      };

      const savedPhoto = await Photo.save(newPhoto);

      res.status(201).json({
        success: true,
        message: 'Foto subida correctamente',
        url: storagePath,
        data: savedPhoto
      });

    } catch (error) {
      console.error('Error al subir la foto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno al subir la foto',
        error: error.message
      });
    }
  }

  /**
   * Obtiene una foto por su ID.
   * 
   * @route GET /api/photos/:id
   * @param {import('express').Request} req - Solicitud con ID de la foto.
   * @param {import('express').Response} res - Respuesta con la foto encontrada.
   * @returns {void}
   */
  static async getPhotoById(req, res) {
    try {
      const { id } = req.params;
      const photo = await Photo.findById(id);

      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }

      res.json({
        success: true,
        data: photo
      });
    } catch (error) {
      console.error('Error al obtener foto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Devuelve todas las fotos con filtros opcionales.
   * 
   * @route GET /api/photos
   * @queryparam {string} [water_source_id] - Filtrar por ID de fuente.
   * @queryparam {string} [review_id] - Filtrar por ID de reseña.
   * @queryparam {string} [user_id] - Filtrar por ID de usuario.
   * @queryparam {number} [limit] - Límite de resultados.
   * @param {import('express').Request} req - Solicitud con filtros opcionales.
   * @param {import('express').Response} res - Respuesta con lista de fotos.
   * @returns {void}
   */
  static async getAllPhotos(req, res) {
    try {
      const { water_source_id, review_id, user_id, limit } = req.query;

      const filters = {};
      if (water_source_id) filters.water_source_id = water_source_id;
      if (review_id) filters.review_id = review_id;
      if (user_id) filters.user_id = user_id;
      if (limit) filters.limit = limit;

      const photos = await Photo.findAll(filters);

      res.json({
        success: true,
        count: photos.length,
        data: photos
      });
    } catch (error) {
      console.error('Error al obtener fotos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Devuelve fotos asociadas a una fuente de agua específica.
   * 
   * @route GET /api/photos/water-source/:waterSourceId
   * @param {import('express').Request} req - Solicitud con ID de fuente.
   * @param {import('express').Response} res - Respuesta con fotos encontradas.
   * @returns {void}
   */
  static async getPhotosByWaterSource(req, res) {
    try {
      const { waterSourceId } = req.params;
      const photos = await Photo.findByWaterSource(waterSourceId);

      res.json({
        success: true,
        count: photos.length,
        data: photos
      });
    } catch (error) {
      console.error('Error al obtener fotos de fuente de agua:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Devuelve fotos asociadas a una reseña específica.
   * 
   * @route GET /api/photos/review/:reviewId
   * @param {import('express').Request} req - Solicitud con ID de reseña.
   * @param {import('express').Response} res - Respuesta con fotos encontradas.
   * @returns {void}
   */
  static async getPhotosByReview(req, res) {
    try {
      const { reviewId } = req.params;
      const photos = await Photo.findByReview(reviewId);

      res.json({
        success: true,
        count: photos.length,
        data: photos
      });
    } catch (error) {
      console.error('Error al obtener fotos de reseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Devuelve las fotos subidas por el usuario autenticado.
   * 
   * @route GET /api/photos/my
   * @param {import('express').Request} req - Solicitud con datos del usuario autenticado.
   * @param {import('express').Response} res - Respuesta con fotos del usuario.
   * @returns {void}
   */
  static async getMyPhotos(req, res) {
    try {
      const user_id = req.user.id;
      const photos = await Photo.findByUser(user_id);

      res.json({
        success: true,
        count: photos.length,
        data: photos
      });
    } catch (error) {
      console.error('Error al obtener mis fotos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Elimina una foto específica si pertenece al usuario o si es admin.
   * 
   * @route DELETE /api/photos/:id
   * @param {import('express').Request} req - Solicitud con ID de la foto y usuario autenticado.
   * @param {import('express').Response} res - Respuesta con resultado de la operación.
   * @returns {void}
   */
  static async deletePhoto(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }

      if (photo.user_id !== user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta foto'
        });
      }

      const deleted = await Photo.delete(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Foto eliminada exitosamente'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = PhotoController;
