import { Dialog, DialogTitle, DialogContent, Box, IconButton, Grid, Typography, Divider, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

function ImageDetailDialog({ image, open, onClose }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      {image && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                {image.title || 'Untitled'}
              </Typography>
              <IconButton onClick={onClose}>
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
                    src={image.imageUrl || image.preview}
                    alt={image.title}
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
                      {image.description || 'No description'}
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
                      <strong>Moon Illumination:</strong> {image.moonPhase !== null && image.moonPhase !== undefined ? `${(image.moonPhase * 100).toFixed(0)}%` : 'Unknown'}
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
                      <strong>Name:</strong> {image.location?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Latitude:</strong> {image.location?.lat || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Longitude:</strong> {image.location?.lng || 'Unknown'}
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
                      <strong>Camera:</strong> {image.metadata?.camera || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Lens:</strong> {image.metadata?.lens || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>ISO:</strong> {image.metadata?.iso || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Aperture:</strong> {image.metadata?.aperture || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Exposure:</strong> {image.metadata?.exposure || 'Unknown'}
                    </Typography>
                  </Box>

                  {/* Fecha */}
                  {image.date && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong> {new Date(image.date).toLocaleString()}
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
  );
}

export default ImageDetailDialog;
