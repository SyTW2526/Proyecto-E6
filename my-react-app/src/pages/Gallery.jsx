import { useAppContext } from '../AppContext';
import { Box, Typography } from "@mui/material";
import AddImageButton from "../components/images/add-image-button/AddImageButton";
import AddImageDialog from "../components/images/add-image-dialog/AddImageDialog";
import ImageGrid from "../components/images/image-grid/ImageGrid";
import { useState } from "react";
import { Photo } from "../models/Photo";

function Gallery() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [photos, setPhotos] = useState([]); // Ahora usamos Photo objects

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
  };

  const handleDeletePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);
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
      <Typography 
        variant="h3" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          color: 'primary.main',
          fontWeight: 600,
          mb: 4
        }}
      >
        My Gallery
      </Typography>

      <Box sx={{ mx: 2 }}>
        <ImageGrid 
          images={imagesForGrid} 
          onDelete={handleDeletePhoto}
        />
      </Box>

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