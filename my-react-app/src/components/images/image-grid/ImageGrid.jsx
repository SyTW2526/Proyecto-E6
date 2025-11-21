import { Grid, Card, CardMedia, CardContent, Typography, IconButton, CardActions } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import ImageDetailDialog from "../image-detail-dialog/ImageDetailDialog";

function ImageGrid({ images, onDelete }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handleDelete = (imageId, event) => {
    onDelete(imageId);
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
            >
              <CardMedia
                component="img"
                height="200"
                image={image.preview}
                alt={image.title}
                sx={{ objectFit: 'cover' }}
                onClick={() => handleImageClick(image)}
              />
              <CardContent sx={{ flexGrow: 1 }} onClick={() => handleImageClick(image)}>
                <Typography variant="h6" gutterBottom>
                  {image.title || 'Untitled'}
                </Typography>
              </CardContent>
              
              {/* Mostrar botón de eliminar solo si onDelete está definido */}
              {onDelete && (
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <IconButton 
                    aria-label="delete" 
                    size="small"
                    onClick={(e) => handleDelete(image.id, e)}
                    sx={{ 
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'white'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <ImageDetailDialog 
        image={selectedImage}
        open={!!selectedImage}
        onClose={handleClose}
      />
    </>
  );
}

export default ImageGrid;