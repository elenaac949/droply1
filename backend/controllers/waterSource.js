const { validationResult } = require('express-validator');
const WaterSource = require('../models/waterSource');

// Crear una nueva fuente de agua
exports.createWaterSource = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, description, latitude, longitude } = req.body;
    const created_by = req.user.id; // El middleware de auth debe poner esto

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
