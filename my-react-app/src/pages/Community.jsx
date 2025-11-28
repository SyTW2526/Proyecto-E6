import { Box, Typography, Divider, TextField, InputAdornment, ButtonGroup, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddPostButton from "../components/posts/add-post-button/AddPostButton";
import AddPostDialog from "../components/posts/add-post-dialog/AddPostDialog";
import PostGrid from "../components/posts/post-grid/PostGrid";
import { useAppContext } from "../AppContext";
import { useState, useMemo } from "react";

function Community() {
  const { posts, loadingPosts, addPost, deletePost } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular"); // "popular" o "recent"

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

  // Filtrar posts según la búsqueda
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }
    
    try {
      const query = searchQuery.toLowerCase();
      return posts.filter((post) => {
        try {
          const userName = (post.userName || '').toLowerCase();
          const title = (post.title || '').toLowerCase();
          const description = (post.description || '').toLowerCase();
          
          // Buscar en los metadatos de las fotos asociadas
          let photosMatch = false;
          if (Array.isArray(post.photos) && post.photos.length > 0) {
            photosMatch = post.photos.some((photo) => {
              try {
                // Verificar que photo es un objeto y no solo un ID
                if (!photo || typeof photo !== 'object') return false;
                
                const photoTitle = String(photo.title || '').toLowerCase();
                const photoDescription = String(photo.description || '').toLowerCase();
                const camera = String(photo.metadata?.camera || '').toLowerCase();
                const lens = String(photo.metadata?.lens || '').toLowerCase();
                const location = String(photo.location || '').toLowerCase();
                const moonPhase = String(photo.moonPhase || '').toLowerCase();
                
                return photoTitle.includes(query) ||
                       photoDescription.includes(query) ||
                       camera.includes(query) ||
                       lens.includes(query) ||
                       location.includes(query) ||
                       moonPhase.includes(query);
              } catch (e) {
                console.error('Error processing photo:', e);
                return false;
              }
            });
          }
          
          return userName.includes(query) || 
                 title.includes(query) || 
                 description.includes(query) ||
                 photosMatch;
        } catch (e) {
          console.error('Error filtering post:', e);
          return false;
        }
      });
    } catch (e) {
      console.error('Error in filteredPosts:', e);
      return posts;
    }
  }, [posts, searchQuery]);

  // Ordenar posts según el criterio seleccionado
  const sortedAndFilteredPosts = useMemo(() => {
    const postsToSort = [...filteredPosts];
    
    if (sortBy === "popular") {
      return postsToSort.sort((a, b) => {
        const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
        const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
        return bLikes - aLikes; // más likes primero
      });
    } else if (sortBy === "recent") {
      return postsToSort.sort((a, b) => {
        const aDate = new Date(a.createdAt || 0);
        const bDate = new Date(b.createdAt || 0);
        return bDate - aDate; // más reciente primero
      });
    }
    
    return postsToSort;
  }, [filteredPosts, sortBy]);

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

      {/* Buscador */}
      <Box sx={{ px: 3, maxWidth: 600, mx: 'auto', mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre de usuario, título o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
            }
          }}
        />
      </Box>

      {/* Botones de ordenamiento */}
      <Box sx={{ px: 3, maxWidth: 600, mx: 'auto', mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ButtonGroup variant="contained" sx={{ boxShadow: 2 }}>
          <Button
            startIcon={<TrendingUpIcon />}
            onClick={() => setSortBy("popular")}
            variant={sortBy === "popular" ? "contained" : "outlined"}
            sx={{
              backgroundColor: sortBy === "popular" ? 'primary.main' : 'transparent',
              color: sortBy === "popular" ? 'white' : 'primary.main',
              '&:hover': {
                backgroundColor: sortBy === "popular" ? 'primary.dark' : 'rgba(24,124,255,0.08)',
              }
            }}
          >
            Más Populares
          </Button>
          <Button
            startIcon={<AccessTimeIcon />}
            onClick={() => setSortBy("recent")}
            variant={sortBy === "recent" ? "contained" : "outlined"}
            sx={{
              backgroundColor: sortBy === "recent" ? 'primary.main' : 'transparent',
              color: sortBy === "recent" ? 'white' : 'primary.main',
              '&:hover': {
                backgroundColor: sortBy === "recent" ? 'primary.dark' : 'rgba(24,124,255,0.08)',
              }
            }}
          >
            Más Recientes
          </Button>
        </ButtonGroup>
      </Box>

      <Box sx={{ px: 3, maxWidth: '100%' }}>
        {loadingPosts ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
            }}
          >
            <Typography 
              sx={{ 
                mt: 2, 
                color: 'text.secondary'
              }}
            >
              Cargando posts...
            </Typography>
          </Box>
        ) : (
          <PostGrid 
            posts={sortedAndFilteredPosts}
            onDelete={handleDeletePost}
          />
        )}
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