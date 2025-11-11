import { Box, Typography, Divider } from "@mui/material";
import AddPostButton from "../components/posts/add-post-button/AddPostButton";
import AddPostDialog from "../components/posts/add-post-dialog/AddPostDialog";
import PostGrid from "../components/posts/post-grid/PostGrid";
import { useAppContext } from "../AppContext";
import { useState } from "react";

function Community() {
  const { posts, addPost, deletePost } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirm = async (postData) => {
    try {
      await addPost(postData);
      handleCloseDialog();
    } catch (error) {
      console.error("Error al crear post:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error("Error al eliminar post:", error);
    }
  };

  return (
    <Box>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          textAlign: "center",
          color: "rgba(44, 44, 44, 0.9)",
          fontWeight: 600,
          mb: 2,
        }}
      >
        Community
      </Typography>
            {/* Aesthetic separator between title and images */}
            <Divider
              sx={{
                width: ["90%", "70%"],
                mx: "auto",
                height: "6px",
                borderRadius: 3,
                background: "linear-gradient(30deg, rgba(24,124,255,0.9) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(24,124,255,0.9) 100%)",
                boxShadow: "0 4px 18px rgba(255,140,0,0.12)",
                my: 3,
              }}
            />

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

export default Community;