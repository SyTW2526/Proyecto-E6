import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from "@mui/material";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

function AddImageDialog({ open, onClose, onConfirm }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Crear URL de preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (!selectedFile) {
      alert("Please select an image first");
      return;
    }
    
    onConfirm({ 
      title, 
      description, 
      file: selectedFile,
      preview: previewUrl 
    });
    
    // Limpiar todos los estados
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleClose = () => {
    // Limpiar estados al cerrar
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add new image</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Select an image to add to your gallery.
        </DialogContentText>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            variant="outlined" 
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
          >
            {selectedFile ? selectedFile.name : "Choose Image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Button>

          {previewUrl && (
            <Box sx={{ 
              textAlign: 'center', 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 2 
            }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                }}
              />
            </Box>
          )}

          <TextField
            label="Image title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Image description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={!selectedFile}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddImageDialog;