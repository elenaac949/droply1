const Photo = require('../models/photoModel');
const { validationResult } = require('express-validator');

class PhotoController {
  // Crear una nueva foto
  static async createPhoto(req, res) {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { water_source_id, review_id, url } = req.body;
      const user_id = req.user.id; // Asumiendo que tienes middleware de autenticación

      // Validar que solo tenga uno de los dos IDs
      if ((water_source_id && review_id) || (!water_source_id && !review_id)) {
        return res.status(400).json({
          success: false,
          message: 'La foto debe estar asociada a una fuente de agua O a una reseña, no a ambas'
        });
      }

      const photoData = {
        water_source_id: water_source_id || null,
        review_id: review_id || null,
        user_id,
        url
      };

      const photo = await Photo.create(photoData);
      
      res.status(201).json({
        success: true,
        message: 'Foto creada exitosamente',
        data: photo
      });
    } catch (error) {
      console.error('Error al crear foto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener foto por ID
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

  // Obtener todas las fotos con filtros
  static async getAllPhotos(req, res) {
    try {
      const { 
        water_source_id, 
        review_id, 
        user_id, 
        status, 
        limit 
      } = req.query;

      const filters = {};
      if (water_source_id) filters.water_source_id = water_source_id;
      if (review_id) filters.review_id = review_id;
      if (user_id) filters.user_id = user_id;
      if (status) filters.status = status;
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

  // Obtener fotos de una fuente de agua específica
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

  // Obtener fotos de una reseña específica
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

  // Obtener fotos del usuario actual
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

  // Actualizar estado de foto (para moderación)
  static async updatePhotoStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validar que el estado sea válido
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser: pending, approved o rejected'
        });
      }

      const photo = await Photo.updateStatus(id, status);

      res.json({
        success: true,
        message: 'Estado de foto actualizado exitosamente',
        data: photo
      });
    } catch (error) {
      console.error('Error al actualizar estado de foto:', error);
      
      if (error.message === 'Foto no encontrada') {
        return res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar foto
  static async deletePhoto(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Verificar que la foto existe y pertenece al usuario
      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }

      // Solo el propietario o un admin puede eliminar la foto
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

  // Obtener fotos pendientes de moderación (solo admin)
  static async getPendingPhotos(req, res) {
    try {
      const photos = await Photo.getPendingPhotos();

      res.json({
        success: true,
        count: photos.length,
        data: photos
      });
    } catch (error) {
      console.error('Error al obtener fotos pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de fotos del usuario
  static async getPhotoStats(req, res) {
    try {
      const user_id = req.user.id;
      const totalPhotos = await Photo.countByUser(user_id);
      const approvedPhotos = await Photo.findAll({ user_id, status: 'approved' });
      const pendingPhotos = await Photo.findAll({ user_id, status: 'pending' });
      const rejectedPhotos = await Photo.findAll({ user_id, status: 'rejected' });

      res.json({
        success: true,
        data: {
          total: totalPhotos,
          approved: approvedPhotos.length,
          pending: pendingPhotos.length,
          rejected: rejectedPhotos.length
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de fotos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = PhotoController;