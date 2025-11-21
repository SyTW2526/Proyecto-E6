const API_URL = 'http://localhost:5000/api';

// ============ FOTOS ============

export const fetchPhotos = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/photos/user/${userId}`);
    if (!response.ok) throw new Error('Error al obtener fotos');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createPhoto = async (photoData) => {
  try {
    const response = await fetch(`${API_URL}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(photoData),
    });
    if (!response.ok) throw new Error('Error al crear foto');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updatePhoto = async (photoId, photoData) => {
  try {
    const response = await fetch(`${API_URL}/photos/${photoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(photoData),
    });
    if (!response.ok) throw new Error('Error al actualizar foto');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deletePhoto = async (photoId, userId) => {
  try {
    const response = await fetch(`${API_URL}/photos/${photoId}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar foto');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const likePhoto = async (photoId, userId) => {
  try {
    const response = await fetch(`${API_URL}/photos/${photoId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Error al dar like');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const unlikePhoto = async (photoId, userId) => {
  try {
    const response = await fetch(`${API_URL}/photos/${photoId}/like/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al quitar like');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const addComment = async (photoId, userId, text) => {
  try {
    const response = await fetch(`${API_URL}/photos/${photoId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, text }),
    });
    if (!response.ok) throw new Error('Error al agregar comentario');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ============ POSTS ============

export const fetchPosts = async () => {
  try {
    const response = await fetch(`${API_URL}/posts`);
    if (!response.ok) throw new Error('Error al obtener posts');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const fetchUserPosts = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/posts/user/${userId}`);
    if (!response.ok) throw new Error('Error al obtener posts del usuario');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Error al crear post');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updatePost = async (postId, postData) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Error al actualizar post');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deletePost = async (postId, userId) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar post');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const likePost = async (postId, userId) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Error al dar like al post');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const unlikePost = async (postId, userId) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/like/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al quitar like del post');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const addPostComment = async (postId, userId, userName, text) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, userName, text }),
    });
    if (!response.ok) throw new Error('Error al agregar comentario al post');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deletePostComment = async (postId, commentId, userId) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/comment/${commentId}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar comentario');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};