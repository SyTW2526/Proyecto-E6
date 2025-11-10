import express from 'express';
import { Photo } from '../models/Photo.js';

const router = express.Router();

// GET - Obtener todas las fotos de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const photos = await Photo.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener fotos', error: error.message });
  }
});

// GET - Obtener una foto específica por ID
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener foto', error: error.message });
  }
});

// POST - Crear una nueva foto
router.post('/', async (req, res) => {
  try {
    const newPhoto = new Photo(req.body);
    const savedPhoto = await newPhoto.save();
    res.status(201).json(savedPhoto);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear foto', error: error.message });
  }
});

// PUT - Actualizar una foto
router.put('/:id', async (req, res) => {
  try {
    const updatedPhoto = await Photo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPhoto) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }
    res.json(updatedPhoto);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar foto', error: error.message });
  }
});

// DELETE - Eliminar una foto
router.delete('/:id', async (req, res) => {
  try {
    const deletedPhoto = await Photo.findByIdAndDelete(req.params.id);
    if (!deletedPhoto) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }
    res.json({ message: 'Foto eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar foto', error: error.message });
  }
});

// POST - Agregar un like a una foto
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }
    
    // Verificar si el usuario ya dio like
    if (photo.likes.includes(userId)) {
      return res.status(400).json({ message: 'Ya diste like a esta foto' });
    }
    
    photo.likes.push(userId);
    await photo.save();
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Error al dar like', error: error.message });
  }
});

// DELETE - Quitar un like de una foto
router.delete('/:id/like/:userId', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }
    
    photo.likes = photo.likes.filter(id => id !== req.params.userId);
    await photo.save();
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Error al quitar like', error: error.message });
  }
});

// POST - Agregar un comentario a una foto
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, text } = req.body;
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }
    
    photo.comments.push({ userId, text });
    await photo.save();
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar comentario', error: error.message });
  }
});

export default router;
