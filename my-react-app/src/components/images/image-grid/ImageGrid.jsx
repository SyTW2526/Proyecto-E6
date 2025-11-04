import { Grid, Card, CardMedia, CardContent, Typography, Dialog, DialogTitle, DialogContent, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

function ImageGrid({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  if (images.length === 0) {
    return (
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ textAlign: 'center', mt: 4 }}
      >
        No images yet. Click the + button to add your first image!
      </Typography>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {images.map((image) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: 6
                }
              }}
              onClick={() => handleImageClick(image)}
            >
              <CardMedia
                component="img"
                height="200"
                image={image.preview}
                alt={image.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {image.title || 'Untitled'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal para mostrar la imagen en grande */}
      <Dialog 
        open={!!selectedImage} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        {selectedImage && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">
                  {selectedImage.title || 'Untitled'}
                </Typography>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img
                  src={selectedImage.preview}
                  alt={selectedImage.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    borderRadius: '8px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
              {selectedImage.description && (
                <Typography variant="body1" color="text.secondary">
                  {selectedImage.description}
                </Typography>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}

export default ImageGrid;