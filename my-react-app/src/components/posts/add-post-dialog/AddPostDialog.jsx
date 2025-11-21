import { useAppContext } from '../../../AppContext';
import { useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Box,
  TextField,
  Grid,
  Card,
  CardMedia,
  Checkbox,
  Typography
} from "@mui/material";

function AddPostDialog({ open, onClose, onConfirm }) {
  const { photos } = useAppContext(); // Obtener fotos del contexto
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);

  const handlePhotoToggle = (photoId) => {
    if (selectedPhotoIds.includes(photoId)) {
      setSelectedPhotoIds(selectedPhotoIds.filter(id => id !== photoId));
    } else {
      setSelectedPhotoIds([...selectedPhotoIds, photoId]);
    }
  };

  const handleConfirm = () => {
    if (selectedPhotoIds.length === 0) {
      alert("Please select at least one photo");
      return;
    }

    const selectedPhotos = photos.filter(photo => 
      selectedPhotoIds.includes(photo._id || photo.id)
    );

    onConfirm({
      title: postTitle,
      description: postDescription,
      photos: selectedPhotos.map(photo => photo._id || photo.id) // Enviar solo IDs
    });

    // Limpiar
    setPostTitle("");
    setPostDescription("");
    setSelectedPhotoIds([]);
    onClose();
  };

  const handleClose = () => {
    setPostTitle("");
    setPostDescription("");
    setSelectedPhotoIds([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Post</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Post Title*"
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

          <Typography variant="h6" sx={{ mt: 2 }}>
            Select Photos from Your Gallery ({selectedPhotoIds.length} selected)
          </Typography>

          {photos.length === 0 ? (
            <Typography color="text.secondary">
              No photos in your gallery. Add some photos first!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {photos.map((photo) => {
                const photoId = photo._id || photo.id;
                return (
                  <Grid item xs={6} sm={4} md={3} key={photoId}>
                    <Card 
                      sx={{ 
                        position: 'relative',
                        cursor: 'pointer',
                        border: selectedPhotoIds.includes(photoId) ? '3px solid' : 'none',
                        borderColor: 'primary.main'
                      }}
                      onClick={() => handlePhotoToggle(photoId)}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={photo.imageUrl}
                        alt={photo.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Checkbox
                        checked={selectedPhotoIds.includes(photoId)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          }
                        }}
                      />
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" noWrap>
                          {photo.title || 'Untitled'}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={selectedPhotoIds.length === 0 || !postTitle}
        >
          Create Post ({selectedPhotoIds.length} photos)
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddPostDialog;