import { useAppContext } from '../AppContext';
import { Box, Typography, Divider } from "@mui/material";
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

  const handleConfirm = async (imageData) => {
    try {
      await addPhoto(imageData); // Usar función del contexto (ahora es async)
      console.log("Photo añadida");
    } catch (error) {
      console.error("Error al añadir foto:", error);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await deletePhoto(photoId); // Usar función del contexto (ahora es async)
    } catch (error) {
      console.error("Error al eliminar foto:", error);
    }
  };

  // Convertir datos del backend a formato para ImageGrid
  const imagesForGrid = photos.map(photo => ({
    id: photo._id || photo.id, // MongoDB usa _id
    title: photo.title,
    description: photo.description,
    preview: photo.imageUrl,
    likes: Array.isArray(photo.likes) ? photo.likes.length : 0,
    comments: Array.isArray(photo.comments) ? photo.comments.length : 0,
    date: photo.createdAt || photo.date,
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
          textAlign: "center",
          color: "rgba(44, 44, 44, 0.9)",
          fontWeight: 600,
          mb: 2,
        }}
      >
        My Gallery
      </Typography>

      {/* Aesthetic separator between title and images */}
      <Divider
        sx={{
          width: ["90%", "70%"],
          mx: "auto",
          height: "6px",
          borderRadius: 3,
          background: "linear-gradient(30deg, rgba(24,124,255,0.9) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(24,124,255,0.9) 100%)",
          boxShadow: "0 4px 18px rgba(255,140,0,0.12)",
          my: 3,
        }}
      />

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