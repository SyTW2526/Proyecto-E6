import { Grid, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, Box, IconButton, 
         CardActions, Divider, ImageList, ImageListItem, TextField, Button, List, ListItem, 
         ListItemText, Avatar, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SendIcon from '@mui/icons-material/Send';
import { useState, useEffect } from "react";
import ImageDetailDialog from "../../images/image-detail-dialog/ImageDetailDialog";
import { useAppContext } from "../../../AppContext";

function PostGrid({ posts, onDelete }) {
  const { currentUser, likePost, unlikePost, addCommentToPost } = useAppContext();
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !currentUser || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    try {
      await addCommentToPost(selectedPost._id || selectedPost.id, commentText.trim());
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Update selectedPost when posts change (to reflect new comments/likes)
  useEffect(() => {
    if (selectedPost) {
      const updatedPost = posts.find(p => (p._id || p.id) === (selectedPost._id || selectedPost.id));
      if (updatedPost) {
        setSelectedPost(updatedPost);
      }
    }
  }, [posts, selectedPost]);

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

  // Ordenar posts por número de likes (de mayor a menor)
  const sortedPosts = [...posts].sort((a, b) => {
    const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
    const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
    return bLikes - aLikes;
  });

  return (
    <>
  <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 1300, mx: 'auto' }}>
      {sortedPosts.map((post) => {
          const previewImages = getPreviewImages(post);
          
          return (
            <Grid item key={post._id || post.id} xs={12} sm={6}>
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
                    <ImageListItem key={photo._id || photo.id}>
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
                <CardActions>
                  {/* Like / Unlike button */}
                  <IconButton
                    color={Array.isArray(post.likes) && currentUser && post.likes.includes(currentUser.id) ? 'secondary' : 'default'}
                    onClick={(event) => {
                      event.stopPropagation();
                      try {
                        if (!currentUser) return;
                        if (Array.isArray(post.likes) && post.likes.includes(currentUser.id)) {
                          unlikePost(post._id || post.id);
                        } else {
                          likePost(post._id || post.id);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    aria-label="like"
                  >
                    {Array.isArray(post.likes) && currentUser && post.likes.includes(currentUser.id) ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>

                  {/* Show like count */}
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {Array.isArray(post.likes) ? post.likes.length : 0}
                  </Typography>

                  {/* Delete button (only for owner) */}
                  {onDelete && currentUser && post.userId === currentUser.id && (
                    <IconButton 
                      color="error" 
                      onClick={(event) => handleDelete(post._id || post.id, event)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </CardActions>
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
            {(selectedPost?.photos || []).map((photo) => (
              <Box 
                key={photo._id || photo.id} 
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

          <Divider sx={{ my: 3 }} />
          
          {/* Comentarios */}
          <Typography variant="h6" gutterBottom>
            Comments ({selectedPost?.comments?.length || 0})
          </Typography>
          
          <List sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
            {selectedPost?.comments && selectedPost.comments.length > 0 ? (
              selectedPost.comments.map((comment, index) => (
                <ListItem key={comment._id || index} alignItems="flex-start" sx={{ px: 0 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {(comment.userName || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" component="span">
                          {comment.userName || 'Unknown User'}
                        </Typography>
                        {comment.date && (
                          <Typography variant="caption" color="text.secondary">
                            • {new Date(comment.date).toLocaleDateString()}
                          </Typography>
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {comment.text}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </List>

          {/* Add Comment */}
          {currentUser && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mt: 1 }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Avatar>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                disabled={isSubmittingComment}
              />
              <IconButton 
                color="primary" 
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || isSubmittingComment}
                sx={{ mt: 1 }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          )}
          {!currentUser && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
              Please log in to comment
            </Typography>
          )}
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