const Photo = require('../models/photoModel');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

class PhotoController {
  
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
      const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'water-sources');

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

  static async getAllPhotos(req, res) {
    try {
      const { 
        water_source_id, 
        review_id, 
        user_id, 
        limit 
      } = req.query;

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
