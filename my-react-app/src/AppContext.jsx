import { createContext, useContext, useState } from 'react';
import { User } from './models/User';
import { Photo } from './models/Photo';
import { AstronomicalEvent } from './models/AstronomicalEvent';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Estado global de la aplicación
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState({ lat: 28.4636, lng: -16.2518 }); // Tenerife por defecto

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
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (userId, updates) => {
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  // ============ ACCIONES PARA FOTOS ============
  const addPhoto = (photoData) => {
    const newPhoto = new Photo(
      Date.now(), // ID temporal
      currentUser?.id,
      photoData.imageUrl,
      photoData.moonPhase,
      photoData.date,
      photoData.location
    );
    setPhotos([...photos, newPhoto]);
  };

  const deletePhoto = (photoId) => {
    setPhotos(photos.filter(p => p.id !== photoId));
  };

  const likePhoto = (photoId) => {
    setPhotos(photos.map(photo => {
      if (photo.id === photoId && currentUser) {
        photo.addLike(currentUser.id);
      }
      return photo;
    }));
  };

  const unlikePhoto = (photoId) => {
    setPhotos(photos.map(photo => {
      if (photo.id === photoId && currentUser) {
        photo.removeLike(currentUser.id);
      }
      return photo;
    }));
  };

  const addCommentToPhoto = (photoId, commentData) => {
    setPhotos(photos.map(photo => {
      if (photo.id === photoId) {
        photo.addComment(commentData);
      }
      return photo;
    }));
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
    return events.filter(event => event.isUpcoming());
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
    users,
    photos,
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
    updateSelectedDate
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de un AppProvider');
  }
  return context;
};