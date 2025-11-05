import { Grid, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, Box, IconButton, 
         CardActions, Divider, ImageList, ImageListItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import ImageDetailDialog from "../../images/image-detail-dialog/ImageDetailDialog";

function PostGrid({ posts, onDelete }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleClose = () => {
    setSelectedPost(null);
  };

  const handleImageClick = (photo, event) => {
    event.stopPropagation();
    setSelectedImage(photo);
  };

  const handleImageClose = () => {
    setSelectedImage(null);
  };

  const handleDelete = (postId, event) => {
    event.stopPropagation(); // Evitar que se abra el modal al eliminar
    onDelete(postId);
  };

  if (posts.length === 0) {
    return (
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ textAlign: 'center', mt: 4 }}
      >
        No posts yet. Click the + button to create your first post!
      </Typography>
    );
  }

  // Función para obtener las primeras 2 imágenes de un post
  const getPreviewImages = (post) => {
    return post.photos?.slice(0, 2) || [];
  };

  return (
    <>
      <Grid container spacing={3}>
        {posts.map((post) => {
          const previewImages = getPreviewImages(post);
          
          return (
            <Grid item key={post.id} xs={12} sm={6}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => handlePostClick(post)}
              >
                <ImageList 
                  cols={previewImages.length} 
                  rowHeight={160} 
                  sx={{ width: '100%', height: 160 }}
                >
                  {previewImages.map((photo) => (
                    <ImageListItem key={photo.id}>
                      <img 
                        src={photo.imageUrl} 
                        alt={photo.title} 
                        loading="lazy" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      display: 'block',
                      mb: 1
                    }}
                  >
                    by {post.userName || 'Unknown User'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {post.description || 'No description'}
                  </Typography>
                </CardContent>
                {onDelete && (
                  <CardActions>
                    <IconButton 
                      color="error" 
                      onClick={(event) => handleDelete(post.id, event)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Diálogo para mostrar detalles del post */}
      <Dialog 
        open={Boolean(selectedPost)} 
        onClose={handleClose} 
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedPost?.title}
          <IconButton 
            aria-label="close" 
            onClick={handleClose} 
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Posted by {selectedPost?.userName || 'Unknown User'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {selectedPost?.description || 'No description'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Photos
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {selectedPost?.photos.map((photo) => (
              <Box 
                key={photo.id} 
                sx={{ 
                  width: 'calc(50% - 8px)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
                onClick={(e) => handleImageClick(photo, e)}
              >
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title} 
                  style={{ width: '100%', borderRadius: 4 }} 
                />
                <Typography variant="caption" display="block" gutterBottom>
                  {photo.title}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      <ImageDetailDialog 
        image={selectedImage}
        open={!!selectedImage}
        onClose={handleImageClose}
      />
    </>
  );
}

export default PostGrid;