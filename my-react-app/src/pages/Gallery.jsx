import { useAppContext } from '../AppContext';
import { Box, Typography } from "@mui/material";
import AddImageButton from "../components/images/add-image-button/AddImageButton";
import AddImageDialog from "../components/images/add-image-dialog/AddImageDialog";
import ImageGrid from "../components/images/image-grid/ImageGrid";
import { useState, useEffect } from "react";
import { Photo } from "../models/Photo";

function Gallery() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [photos, setPhotos] = useState([]); // Ahora usamos Photo objects

  // Cargar photos desde localStorage al iniciar
  useEffect(() => {
    const savedPhotos = localStorage.getItem('gallery-photos');
    if (savedPhotos) {
      const photosData = JSON.parse(savedPhotos);
      const photoObjects = photosData.map(data => Photo.fromServerData(data));
      setPhotos(photoObjects);
    }
  }, []);

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = (imageData) => {
    // Crear una instancia de Photo usando el método estático
    const currentUserId = 1; // Aquí deberías obtener el ID del usuario actual
    const newPhoto = Photo.fromDialogData(imageData, currentUserId);
    
    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);
    console.log("Photo añadida:", newPhoto);
    
    // Guardar en localStorage
    savePhotosToLocalStorage(updatedPhotos);
  };

  const handleDeletePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);
    savePhotosToLocalStorage(updatedPhotos);
  };

  // Guardar en localStorage
  const savePhotosToLocalStorage = (photosArray) => {
    const photosJSON = photosArray.map(photo => photo.toJSON());
    localStorage.setItem('gallery-photos', JSON.stringify(photosJSON));
  };

  // Convertir Photo objects a formato completo para ImageGrid
  const imagesForGrid = photos.map(photo => ({
    id: photo.id,
    title: photo.title,
    description: photo.description,
    preview: photo.imageUrl,
    likes: photo.getLikesCount(),
    comments: photo.getCommentsCount(),
    date: photo.date,
    moonPhase: photo.moonPhase,
    location: photo.location,
    metadata: photo.metadata
  }));

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        My gallery
      </Typography>

      <ImageGrid 
        images={imagesForGrid} 
        onDelete={handleDeletePhoto}
      />

      <AddImageButton onClick={handleAddClick} />
      <AddImageDialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        onConfirm={handleConfirm}
      />
    </Box>
  );
}

export default Gallery;