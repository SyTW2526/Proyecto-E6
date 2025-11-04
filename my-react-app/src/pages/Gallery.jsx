import { Box, Typography } from "@mui/material";
import AddImageButton from "../components/add-image-button/AddImageButton";
import AddImageDialog from "../components/add-image-dialog/AddImageDialog";
import ImageGrid from "../components/image-grid/ImageGrid";
import { useState } from "react";

function Gallery() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [images, setImages] = useState([]); // Estado para guardar las imágenes

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = (imageData) => {
    // Se añade la nueva imagen al array de imágenes
    const newImage = {
      id: Date.now(), // ID único basado en timestamp
      title: imageData.title,
      description: imageData.description,
      preview: imageData.preview, // URL de la imagen en base64
    };
    
    setImages([...images, newImage]); // Añadir al estado
    console.log("Imagen añadida:", newImage);
  };

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        User's gallery
      </Typography>

      <ImageGrid images={images} />

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