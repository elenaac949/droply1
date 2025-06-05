const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const WaterSource = require('../models/waterSourceModel');

/**
 * Crea una nueva fuente de agua en la base de datos.
 * 
 * @route POST /water-sources
 * @param {Request} req - Datos de la fuente en el body.
 * @param {Response} res - Mensaje de éxito o error.
 */
exports.createWaterSource = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name, description, latitude, longitude,
      type, is_accessible, schedule,
      country, city, postal_code, address,
      is_osm, osm_id
    } = req.body;

    const user_id = req.user?.id ?? null;

    const [[{ count }]] = await WaterSource.existsAtCoordinates(latitude, longitude);
    if (count > 0) {
      return res.status(400).json({ error: 'Ya existe una fuente en esa ubicación.' });
    }
/* generamos el id diectamente aqui en vez de en la base de datos */
    const id = uuidv4();
    const fuente = new WaterSource(id,
      name, description, latitude, longitude, type,
      is_accessible, schedule, country, city, postal_code,
      address, user_id, is_osm, osm_id
    );

    await WaterSource.save(fuente);

    res.status(201).json({
      success: true,
      message: 'Fuente creada correctamente.',
      id
    });

  } catch (err) {
    console.error('Error al crear fuente:', err);
    res.status(500).json({ error: 'Error al crear la fuente de agua' });
  }
};


/* encontrar fuente por usuario y coordenaas */

exports.getLastByUser = async (req, res) => {
  const user_id = req.user.id;

  try {
    const fuente = await WaterSource.findLastByUser(user_id);

    if (!fuente) {
      return res.status(404).json({ message: 'No se encontró ninguna fuente para este usuario.' });
    }

    res.json({ data: fuente });
  } catch (error) {
    console.error('Error al obtener la última fuente por usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


/**
 * Obtiene todas las fuentes de agua (sin filtrar).
 * 
 * @route GET /water-sources
 */
exports.getAllWaterSources = async (req, res) => {
  try {
    const [rows] = await WaterSource.fetchAll();
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las fuentes de agua' });
  }
};

/**
 * Obtiene todas las fuentes de agua con estado "approved".
 * 
 * @route GET /water-sources/approved
 */
exports.getApprovedWaterSources = async (req, res) => {
  try {
    const [rows] = await WaterSource.fetchApproved();
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las fuentes aprobadas' });
  }
};

/**
 * Obtiene los datos de una fuente de agua por su ID, incluyendo reseñas.
 * 
 * @route GET /water-sources/:id
 */
exports.getById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [sourceRows] = await WaterSource.getBasicById(id);
    if (sourceRows.length === 0) {
      return res.status(404).json({ message: 'Fuente no encontrada' });
    }

    const source = sourceRows[0];
    const [reviews] = await WaterSource.getReviews(id);

    let average_rating = null;
    let total_reviews = reviews.length;
    if (total_reviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      average_rating = parseFloat((sum / total_reviews).toFixed(2));
    }

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
};

/**
 * Actualiza el estado de una fuente ('pending', 'approved', 'rejected').
 * 
 * @route PATCH /water-sources/:id/status
 */
exports.updateStatus = async (req, res) => {
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

/**
 * Obtiene todas las fuentes con estado "pending".
 * 
 * @route GET /water-sources/pending
 */
exports.getPendingSources = async (req, res) => {
  try {
    const [rows] = await WaterSource.fetchPending();
    res.status(200).json(rows || []);
  } catch (err) {
    console.error('Error en /pending:', err);
    res.status(500).json({ error: 'Error al obtener fuentes pendientes' });
  }
};

/**
 * Elimina una fuente de agua por su ID.
 * 
 * @route DELETE /water-sources/:id
 */
exports.deleteWaterSource = async (req, res) => {
  const { id } = req.params;
  try {
    await WaterSource.deleteById(id);
    res.status(200).json({ message: 'Fuente eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar fuente:', err);
    res.status(500).json({ error: 'Error al eliminar fuente' });
  }
};

/**
 * Actualiza todos los datos de una fuente de agua.
 * 
 * @route PUT /water-sources/:id
 */
exports.updateWaterSource = async (req, res) => {
  const { id } = req.params;
  const {
    name, description, latitude, longitude,
    type, is_accessible, schedule,
    country, city, postal_code, address
  } = req.body;

  try {
    await WaterSource.updateFull(
      id,
      name,
      description,
      latitude,
      longitude,
      type,
      is_accessible,
      schedule,
      country,
      city,
      postal_code,
      address
    );

    res.status(200).json({ message: 'Fuente actualizada correctamente.' });
  } catch (err) {
    console.error('Error al actualizar la fuente:', err);
    res.status(500).json({ message: 'Error al actualizar la fuente de agua' });
  }
};

/**
 * Obtiene una fuente de agua por su identificador OSM.
 * 
 * @route GET /water-sources/osm/:osmId
 */
exports.getByOSMId = async (req, res) => {
  const { osmId } = req.params;

  try {
    const [rows] = await WaterSource.findByOSMId(osmId);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Fuente no encontrada' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error al obtener fuente por osm_id:', err);
    res.status(500).json({ error: 'Error al buscar fuente por OSM ID' });
  }
};
