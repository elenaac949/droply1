const { validationResult } = require('express-validator');
const WaterSource = require('../models/waterSource');
const db = require('../util/database');

// Crear una nueva fuente de agua
exports.createWaterSource = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, description, latitude, longitude } = req.body;
    const created_by = req.user.id; // El middleware de auth debe poner esto

    // 💡 Verificar si ya existe una fuente cercana
    const [[{ count }]] = await WaterSource.existsAtCoordinates(latitude, longitude);
    if (count > 0) {
      return res.status(400).json({ error: 'Ya existe una fuente en esa ubicación.' });
    }

    const waterSource = new WaterSource(name, description, latitude, longitude, created_by);
    await WaterSource.save(waterSource);

    res.status(201).json({ message: 'Fuente de agua creada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la fuente de agua' });
  }
};

// Listar todas las fuentes de agua
exports.getAllWaterSources = async (req, res) => {
  try {
    const [rows] = await WaterSource.fetchAll();
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las fuentes de agua' });
  }
};

/* Listar solo fuentes de agua aprobadas */
exports.getApprovedWaterSources = async (req, res) => {
  try {
    const [rows] = await WaterSource.fetchApproved();
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las fuentes aprobadas' });
  }
};

/* Obtener informacion sobre una fuente de agua en base a su id */
exports.getById = async (req, res, next) => {
  const { id } = req.params;

  try {
    // 1. Obtener datos básicos de la fuente
    const [sourceRows] = await WaterSource.getBasicById(id);

    if (sourceRows.length === 0) {
      return res.status(404).json({ message: 'Fuente no encontrada' });
    }

    const source = sourceRows[0];

    // 2. Obtener valoraciones aprobadas
    const [reviews] = await WaterSource.getReviews(id);

    // 3. Calcular media y total 
    let average_rating = null;
    let total_reviews = reviews.length;

    if (total_reviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      average_rating = parseFloat((sum / total_reviews).toFixed(2));
    }

    // 4. Responder con los datos combinados
    res.status(200).json({
      ...source,
      reviews,
      average_rating,
      total_reviews
    });

  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
}

exports.updateStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Estado no válido' });
  }

  try {
    await WaterSource.updateStatus(id, status);
    res.status(200).json({ message: `Estado actualizado a '${status}'` });
  } catch (err) {
    console.error('Error al actualizar estado:', err);
    res.status(500).json({ message: 'Error al actualizar el estado' });
  }
};
