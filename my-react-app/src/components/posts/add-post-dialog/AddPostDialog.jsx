import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  Box,
  TextField,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid
} from "@mui/material";
import { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

function AddPostDialog({ open, onClose, onConfirm }) {
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [images, setImages] = useState([]); // Array de imágenes

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files); // Convertir FileList a Array
    
    files.forEach((file) => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage = {
            id: Date.now() + Math.random(), // ID único
            file: file,
            preview: reader.result,
            title: "",
            description: ""
          };
          setImages((prevImages) => [...prevImages, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Resetear el input para poder seleccionar el mismo archivo de nuevo
    event.target.value = "";
  };

  const handleImageTitleChange = (imageId, newTitle) => {
    setImages(images.map(img => 
      img.id === imageId ? { ...img, title: newTitle } : img
    ));
  };

  const handleImageDescriptionChange = (imageId, newDescription) => {
    setImages(images.map(img => 
      img.id === imageId ? { ...img, description: newDescription } : img
    ));
  };

  const handleRemoveImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const handleConfirm = () => {
    if (images.length === 0) {
      alert("Please add at least one image to your post");
      return;
    }
    
    onConfirm({ 
      postTitle,
      postDescription,
      images: images
    });
    
    // Limpiar todos los estados
    setPostTitle("");
    setPostDescription("");
    setImages([]);
    onClose();
  };

  const handleClose = () => {
    // Limpiar estados al cerrar
    setPostTitle("");
    setPostDescription("");
    setImages([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Post</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Add images and information for your new post.
        </DialogContentText>
        
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Campos del post general */}
          <TextField
            label="Post Title"
            variant="outlined"
            fullWidth
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
          <TextField
            label="Post Description"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
          />

          {/* Botón para añadir imágenes */}
          <Button 
            variant="outlined" 
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
          >
            Add Images
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileChange}
            />
          </Button>

          {/* Lista de imágenes añadidas */}
          {images.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Images ({images.length})
              </Typography>
              <Grid container spacing={2}>
                {images.map((image) => (
                  <Grid item xs={12} sm={6} key={image.id}>
                    <Card sx={{ position: 'relative' }}>
                      {/* Botón de eliminar */}
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          }
                        }}
                        onClick={() => handleRemoveImage(image.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>

                      {/* Preview de la imagen */}
                      <CardMedia
                        component="img"
                        height="150"
                        image={image.preview}
                        alt={image.title || 'Image preview'}
                        sx={{ objectFit: 'cover' }}
                      />

                      {/* Campos de título y descripción por imagen */}
                      <CardContent>
                        <TextField
                          label="Image Title"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={image.title}
                          onChange={(e) => handleImageTitleChange(image.id, e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          label="Image Description"
                          variant="outlined"
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          value={image.description}
                          onChange={(e) => handleImageDescriptionChange(image.id, e.target.value)}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={images.length === 0}
        >
          Create Post ({images.length} {images.length === 1 ? 'image' : 'images'})
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddPostDialog;