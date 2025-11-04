import { Grid, Card, CardMedia, CardContent, Typography, Dialog, DialogTitle, DialogContent, Box, IconButton, CardActions, Divider, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useState } from "react";

function ImageGrid({ images, onDelete }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handleDelete = (imageId, event) => {
    event.stopPropagation(); // Evitar que se abra el modal al eliminar
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

      {/* Modal para mostrar la imagen en grande */}
      <Dialog 
        open={!!selectedImage} 
        onClose={handleClose}
        maxWidth="lg"
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
              <Grid container spacing={3}>
                {/* Imagen */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ 
                    textAlign: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    p: 2
                  }}>
                    <img
                      src={selectedImage.preview}
                      alt={selectedImage.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '60vh',
                        borderRadius: '8px',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                </Grid>

                {/* Información */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Descripción */}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {selectedImage.description || 'Unknown'}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Información Astronómica */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <NightsStayIcon fontSize="small" />
                        <Typography variant="h6">
                          Astronomical Info
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Moon Illumination:</strong> {selectedImage.moonPhase !== null && selectedImage.moonPhase !== undefined ? `${(selectedImage.moonPhase * 100).toFixed(0)}%` : 'Unknown'}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Ubicación */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOnIcon fontSize="small" />
                        <Typography variant="h6">
                          Location
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Name:</strong> {selectedImage.location?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Latitude:</strong> {selectedImage.location?.lat || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Longitude:</strong> {selectedImage.location?.lng || 'Unknown'}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Metadata de cámara */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CameraAltIcon fontSize="small" />
                        <Typography variant="h6">
                          Camera Settings
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Camera:</strong> {selectedImage.metadata?.camera || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Lens:</strong> {selectedImage.metadata?.lens || 'Unknown'}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        <Chip 
                          label={`ISO: ${selectedImage.metadata?.iso || 'Unknown'}`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`Exposure: ${selectedImage.metadata?.exposure || 'Unknown'}`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`Aperture: ${selectedImage.metadata?.aperture || 'Unknown'}`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    {/* Fecha */}
                    {selectedImage.date && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Date:</strong> {new Date(selectedImage.date).toLocaleString()}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}

export default ImageGrid;