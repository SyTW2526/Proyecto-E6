import express from 'express';
import { Post } from '../models/Post.js';

const router = express.Router();

// GET - Obtener todos los posts de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate('photos')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener posts', error: error.message });
  }
});

// GET - Obtener todos los posts (feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('photos')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener posts', error: error.message });
  }
});

// GET - Obtener un post específico por ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('photos');
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener post', error: error.message });
  }
});

// POST - Crear un nuevo post
router.post('/', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    const populatedPost = await Post.findById(savedPost._id).populate('photos');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear post', error: error.message });
  }
});

// PUT - Actualizar un post
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('photos');
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar post', error: error.message });
  }
});

// DELETE - Eliminar un post
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query; // Recibir userId como query parameter
    
    if (!userId) {
      return res.status(400).json({ message: 'Se requiere el ID del usuario' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    
    // Verificar que el usuario que intenta borrar sea el dueño del post
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar post', error: error.message });
  }
});

// POST - Agregar un like a un post
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    
    // Verificar si el usuario ya dio like
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Ya diste like a este post' });
    }
    
    post.likes.push(userId);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error al dar like', error: error.message });
  }
});

// DELETE - Quitar un like de un post
router.delete('/:id/like/:userId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    
    post.likes = post.likes.filter(userId => userId !== req.params.userId);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error al quitar like', error: error.message });
  }
});

// POST - Agregar un comentario a un post
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, userName, userProfilePic, text } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    
  post.comments.push({ userId, userName, userProfilePic, text, date: new Date() });
  await post.save();
  // Return the post populated with photos to keep frontend data consistent
  const populatedPost = await Post.findById(post._id).populate('photos');
  res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar comentario', error: error.message });
  }
});

// DELETE - Eliminar un comentario de un post
router.delete('/:id/comment/:commentId', async (req, res) => {
  try {
    const { userId } = req.query; // Recibir userId como query parameter
    
    if (!userId) {
      return res.status(400).json({ message: 'Se requiere el ID del usuario' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    
    // Buscar el comentario
    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    
    // Verificar que el usuario que intenta borrar sea el dueño del comentario
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
    }
    
    // Eliminar el comentario
    comment.deleteOne();
    await post.save();
    
    // Return the post populated with photos to keep frontend data consistent
    const populatedPost = await Post.findById(post._id).populate('photos');
    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar comentario', error: error.message });
  }
});

export default router;
