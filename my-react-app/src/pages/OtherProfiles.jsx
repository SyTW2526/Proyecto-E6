import { Box, Typography } from "@mui/material";
import AddPostButton from "../components/posts/add-post-button/AddPostButton";
import AddPostDialog from "../components/posts/add-post-dialog/AddPostDialog";
import PostGrid from "../components/posts/post-grid/PostGrid";
import { useAppContext } from "../AppContext";
import { useState } from "react";

function OtherProfiles() {
  const { posts, addPost, deletePost } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = (postData) => {
    addPost(postData);
    handleCloseDialog();
  };

  const handleDeletePost = (postId) => {
    deletePost(postId);
  };

  return (
    <Box>
      <Typography 
        variant="h3" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          color: 'primary.main',
          fontWeight: 600,
          mb: 4
        }}
      >
        Other Profiles
      </Typography>

      <Box sx={{ px: 3, maxWidth: '100%' }}>
        <PostGrid 
          posts={posts}
          onDelete={handleDeletePost}
        />
      </Box>

      <AddPostButton onClick={handleAddClick} />

      <AddPostDialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        onConfirm={handleConfirm} 
      />
    </Box>
  );
}

export default OtherProfiles;