import { createContext, useContext, useState, useEffect } from "react";
import { User } from "./models/User";
import { Photo } from "./models/Photo";
import { AstronomicalEvent } from "./models/AstronomicalEvent";
import * as api from "./services/api";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Estado global de la aplicación
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [loadingPosts, setLoadingPosts] = useState(false); // Estado de carga de posts
  const [loadingImages, setLoadingImages] = useState(false); // Estado de carga de imágenes
  const [users, setUsers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState({ lat: 28.4636, lng: -16.2518 }); // Tenerife por defecto

  // Verificar si hay token guardado y validarlo con el servidor al cargar
  useEffect(() => {
    const token = localStorage.getItem("artemis_token");

    if (token) {
      // Verificar token con el servidor
      fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token inválido");
          return res.json();
        })
        .then((data) => {
          // Token válido - establecer usuario
          setCurrentUser(data.user);
          localStorage.setItem("artemis_user", JSON.stringify(data.user));
        })
        .catch((error) => {
          // Token expirado o inválido - limpiar localStorage
          console.error("Sesión expirada:", error);
          localStorage.removeItem("artemis_token");
          localStorage.removeItem("artemis_user");
        })
        .finally(() => {
          setLoading(false); // Terminó de verificar
        });
    } else {
      setLoading(false); // No hay token, terminar carga
    }
  }, []);

  // Cargar fotos cuando cambia el usuario actual
  useEffect(() => {
    const loadPhotos = async () => {
      if (currentUser) {
        setLoadingImages(true);
        try {
          const photosData = await api.fetchPhotos(currentUser.id);
          setPhotos(photosData);
        } catch (error) {
          console.error("Error al cargar fotos:", error);
        } finally {
          setLoadingImages(false);
        }
      } else {
        setPhotos([]);
        setLoadingImages(false);
      }
    };
    
    loadPhotos();
  }, [currentUser]);

  // Cargar posts cuando cambia el usuario actual
  useEffect(() => {
    const loadPosts = async () => {
      if (currentUser) {
        setLoadingPosts(true);
        try {
          const postsData = await api.fetchPosts();
          setPosts(postsData);
        } catch (error) {
          console.error("Error al cargar posts:", error);
        } finally {
          setLoadingPosts(false);
        }
      } else {
        setPosts([]);
        setLoadingPosts(false);
      }
    };
    
    loadPosts();
  }, [currentUser]);

  // ============ ACCIONES PARA USUARIOS ============
  const loginUser = (userData) => {
    const user = new User(
      userData.id,
      userData.name,
      userData.email,
      userData.profilePic,
      userData.bio
    );
    setCurrentUser(user);
    // Guardar en localStorage para persistencia
    localStorage.setItem("artemis_user", JSON.stringify(user));
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("artemis_user");
    localStorage.removeItem("artemis_token"); // También borrar el token
  };

  const updateUserProfile = (userId, updates) => {
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  // ============ ACCIONES PARA FOTOS ============
  const addPhoto = async (imageData) => {
    try {
      // Preparar los datos para el backend
      const photoData = {
        userId: currentUser?.id || 1,
        title: imageData.title,
        description: imageData.description,
        imageUrl: imageData.imageUrl, // Base64 string
        moonPhase: imageData.moonPhase,
        location: imageData.location,
        metadata: {
          camera: imageData.camera,
          lens: imageData.lens,
          iso: imageData.iso,
          exposure: imageData.exposure,
          aperture: imageData.aperture
        }
      };

      // Guardar en backend
      const savedPhoto = await api.createPhoto(photoData);
      
      // Actualizar estado local
      setPhotos([savedPhoto, ...photos]);
      return savedPhoto;
    } catch (error) {
      console.error("Error al guardar foto:", error);
      throw error;
    }
  };

  const deletePhoto = async (photoId) => {
    try {
      if (!currentUser) {
        throw new Error("Debes estar logueado para eliminar fotos");
      }
      await api.deletePhoto(photoId, currentUser.id);
      setPhotos(photos.filter((p) => p._id !== photoId));
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      alert(error.message || "No tienes permiso para eliminar esta foto");
      throw error;
    }
  };

  const likePhoto = async (photoId) => {
    try {
      if (!currentUser) return;
      await api.likePhoto(photoId, currentUser.id);
      setPhotos(
        photos.map((photo) => {
          if (photo._id === photoId) {
            return { ...photo, likes: [...photo.likes, currentUser.id] };
          }
          return photo;
        })
      );
    } catch (error) {
      console.error("Error al dar like:", error);
      throw error;
    }
  };

  const unlikePhoto = async (photoId) => {
    try {
      if (!currentUser) return;
      await api.unlikePhoto(photoId, currentUser.id);
      setPhotos(
        photos.map((photo) => {
          if (photo._id === photoId) {
            return { ...photo, likes: photo.likes.filter(id => id !== currentUser.id) };
          }
          return photo;
        })
      );
    } catch (error) {
      console.error("Error al quitar like:", error);
      throw error;
    }
  };

  const addCommentToPhoto = async (photoId, commentText) => {
    try {
      if (!currentUser) return;
      const result = await api.addComment(photoId, currentUser.id, commentText);
      setPhotos(
        photos.map((photo) => {
          if (photo._id === photoId) {
            return result;
          }
          return photo;
        })
      );
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      throw error;
    }
  };

  // ============ ACCIONES PARA POSTS ============
  const addPost = async (postData) => {
    try {
      const newPostData = {
        userId: currentUser?.id || 1,
        userName: currentUser?.name || 'Unknown User',
        title: postData.title,
        description: postData.description,
        photos: postData.photos || [] // Array de IDs de fotos
      };

      const savedPost = await api.createPost(newPostData);
      setPosts([savedPost, ...posts]);
      return savedPost;
    } catch (error) {
      console.error("Error al crear post:", error);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      if (!currentUser) {
        throw new Error("Debes estar logueado para eliminar posts");
      }
      await api.deletePost(postId, currentUser.id);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (error) {
      console.error("Error al eliminar post:", error);
      alert(error.message || "No tienes permiso para eliminar este post");
      throw error;
    }
  };

  const likePost = async (postId) => {
    try {
      if (!currentUser) return;
      await api.likePost(postId, currentUser.id);
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return { ...post, likes: [...post.likes, currentUser.id] };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error al dar like al post:", error);
      throw error;
    }
  };

  const unlikePost = async (postId) => {
    try {
      if (!currentUser) return;
      await api.unlikePost(postId, currentUser.id);
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return { ...post, likes: post.likes.filter(id => id !== currentUser.id) };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error al quitar like del post:", error);
      throw error;
    }
  };

  const addCommentToPost = async (postId, commentText) => {
    try {
      if (!currentUser) return;
      const result = await api.addPostComment(postId, currentUser.id, currentUser.name, commentText);
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return result;
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error al agregar comentario al post:", error);
      throw error;
    }
  };

  const deleteCommentFromPost = async (postId, commentId) => {
    try {
      if (!currentUser) {
        throw new Error("Debes estar logueado para eliminar comentarios");
      }
      const result = await api.deletePostComment(postId, commentId, currentUser.id);
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return result;
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      alert(error.message || "No tienes permiso para eliminar este comentario");
      throw error;
    }
  };

  // ============ ACCIONES PARA EVENTOS ============
  const addEvent = (eventData) => {
    const newEvent = new AstronomicalEvent(
      Date.now(),
      eventData.type,
      eventData.date,
      eventData.description,
      eventData.location
    );
    setEvents([...events, newEvent]);
  };

  const getUpcomingEvents = () => {
    return events.filter((event) => event.isUpcoming());
  };

  // ============ ACCIONES PARA CONFIGURACIÓN ============
  const updateLocation = (newLocation) => {
    setLocation(newLocation);
  };

  const updateSelectedDate = (newDate) => {
    setSelectedDate(newDate);
  };

  // Valor del contexto (lo que compartimos con toda la app)
  const value = {
    // Estado
    currentUser,
    loading, // Compartir estado de carga
    loadingPosts, // Estado de carga de posts
    loadingImages, // Estado de carga de imágenes
    users,
    photos,
    posts,
    events,
    selectedDate,
    location,

    // Acciones de usuarios
    loginUser,
    logoutUser,
    updateUserProfile,

    // Acciones de fotos
    addPhoto,
    deletePhoto,
    likePhoto,
    unlikePhoto,
    addCommentToPhoto,

    // Acciones de posts
    addPost,
    deletePost,
    likePost,
    unlikePost,
    addCommentToPost,
    deleteCommentFromPost,

    // Acciones de eventos
    addEvent,
    getUpcomingEvents,

    // Acciones de configuración
    updateLocation,
    updateSelectedDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook personalizado para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext debe usarse dentro de un AppProvider");
  }
  return context;
};
