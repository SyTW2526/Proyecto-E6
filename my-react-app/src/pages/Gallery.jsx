import { useAppContext } from '../AppContext';
import { Box, Typography } from "@mui/material";
import AddImageButton from "../components/images/add-image-button/AddImageButton";
import AddImageDialog from "../components/images/add-image-dialog/AddImageDialog";
import ImageGrid from "../components/images/image-grid/ImageGrid";
import { useState } from "react";

function Gallery() {
  const { photos, addPhoto, deletePhoto } = useAppContext(); // Usar contexto
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = (imageData) => {
    addPhoto(imageData); // Usar función del contexto
    console.log("Photo añadida");
  };

  const handleDeletePhoto = (photoId) => {
    deletePhoto(photoId); // Usar función del contexto
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