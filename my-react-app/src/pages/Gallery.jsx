import { Box } from "@mui/material";
import AddImageButton from "../components/add-image-button/AddImageButton";
import AddImageDialog from "../components/add-image-dialog/AddImageDialog";
import { useState } from "react";

function Gallery() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = () => {
    // Aquí puedes añadir lógica adicional si la necesitas
    console.log("Imagen añadida desde Gallery");
  };

  return (
    <Box>
      <h1>User's gallery</h1>
      <p>View your photo gallery</p>
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