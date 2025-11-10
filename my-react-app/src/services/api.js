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

export const deletePhoto = async (photoId) => {
  try {
    const response = await fetch(`${API_URL}/photos/${photoId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar foto');
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
