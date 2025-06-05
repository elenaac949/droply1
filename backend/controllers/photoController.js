const Photo = require('../models/photoModel');
const { validationResult } = require('express-validator');
const fs = require('fs').promises; // Para eliminar archivos temporales
const path = require('path');

class PhotoController {
  
  static async uploadPhoto(req, res) {
    try {
      const user_id = req.user.id;
      const { water_source_id, review_id } = req.body;

      // Validar archivo subido
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha subido ningún archivo'
        });
      }

      // Obtener ruta relativa del archivo
      const storagePath = `/uploads/water-sources/${req.file.filename}`;
      const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'water-sources');

      // Guardar en la base de datos
      const newPhoto = {
        user_id,
        water_source_id: water_source_id || null,
        review_id: review_id || null,
        url: storagePath,
        status: 'pending'
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


      // Eliminar de la base de datos
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
}

module.exports = PhotoController;