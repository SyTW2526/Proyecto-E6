import { Box, Typography } from "@mui/material";
import AddPostButton from "../components/posts/add-post-button/AddPostButton";
import AddImageDialog from "../components/images/add-image-dialog/AddImageDialog";
import { useState } from "react";

function OtherProfiles() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = (imageData) => {
    // Lógica para manejar la imagen añadida
    console.log("Imagen añadida desde OtherProfiles:", imageData);
  };

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Other User's Profiles
      </Typography>

      <AddPostButton onClick={handleAddClick} />
      <AddImageDialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        onConfirm={handleConfirm}
      />
    </Box>
  );
}

export default OtherProfiles;