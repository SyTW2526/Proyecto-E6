import { createContext, useContext, useState, useEffect } from "react";
import { User } from "./models/User";
import { Photo } from "./models/Photo";
import { AstronomicalEvent } from "./models/AstronomicalEvent";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Estado global de la aplicación
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga inicial
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
  const addPhoto = (imageData) => {
    const newPhoto = Photo.fromDialogData(imageData, currentUser?.id || 1);
    setPhotos([...photos, newPhoto]);
    return newPhoto;
  };

  const deletePhoto = (photoId) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const likePhoto = (photoId) => {
    setPhotos(
      photos.map((photo) => {
        if (photo.id === photoId && currentUser) {
          photo.addLike(currentUser.id);
        }
        return photo;
      })
    );
  };

  const unlikePhoto = (photoId) => {
    setPhotos(
      photos.map((photo) => {
        if (photo.id === photoId && currentUser) {
          photo.removeLike(currentUser.id);
        }
        return photo;
      })
    );
  };

  const addCommentToPhoto = (photoId, commentData) => {
    setPhotos(
      photos.map((photo) => {
        if (photo.id === photoId) {
          photo.addComment(commentData);
        }
        return photo;
      })
    );
  };

  // ============ ACCIONES PARA POSTS ============
  const addPost = (postData) => {
    const newPost = {
      id: Date.now(),
      title: postData.title,
      description: postData.description,
      photos: postData.photos,
      userId: currentUser?.id || 1,
      userName: currentUser?.name || "Unknown User",
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
    };
    setPosts([...posts, newPost]);
    return newPost;
  };

  const deletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const likePost = (postId) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId && currentUser) {
          if (!post.likes.includes(currentUser.id)) {
            post.likes.push(currentUser.id);
          }
        }
        return post;
      })
    );
  };

  const unlikePost = (postId) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId && currentUser) {
          post.likes = post.likes.filter((userId) => userId !== currentUser.id);
        }
        return post;
      })
    );
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
