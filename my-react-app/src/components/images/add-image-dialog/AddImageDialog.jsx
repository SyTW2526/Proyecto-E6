import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, TextField, Grid } from "@mui/material";
import { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

function AddImageDialog({ open, onClose, onConfirm }) {
  // Estados básicos
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [captureDate, setCaptureDate] = useState(""); 

  // Estados de metadata de cámara
  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");
  const [iso, setIso] = useState("");
  const [exposure, setExposure] = useState("");
  const [aperture, setAperture] = useState("");

  // Estados astronómicos
  const [moonPhase, setMoonPhase] = useState("");
  
  // Estados de ubicación
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
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
    
    // Preparar los datos completos
    const imageData = { title, description, file: selectedFile, preview: previewUrl,
                        metadata: { camera, lens, iso, exposure, aperture },
      moonPhase: moonPhase ? parseFloat(moonPhase) / 100 : null,
      location: (latitude && longitude) ? {
        lat: parseFloat(latitude), lng: parseFloat(longitude), name: locationName
      } : null,
      date: captureDate
    };
    
    onConfirm(imageData);
    
    // Limpiar todos los estados
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaptureDate("");
    setCamera("");
    setLens("");
    setIso("");
    setExposure("");
    setAperture("");
    setMoonPhase("");
    setLatitude("");
    setLongitude("");
    setLocationName("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add new image</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Add an image to your gallery with detailed information.
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
                  maxHeight: '250px',
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
            required
          />
          <TextField
            label="Image description"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Fecha de captura */}
          <TextField
            label="Capture Date"
            variant="outlined"
            fullWidth
            type="date"
            value={captureDate}
            onChange={(e) => setCaptureDate(e.target.value)}
          />

          {/* Información astronómica */}
          <TextField
            label="Moon illumination (%)"
            variant="outlined"
            fullWidth
            type="number"
            value={moonPhase}
            onChange={(e) => setMoonPhase(e.target.value)}
            placeholder="0-100"
          />

          {/* Ubicación */}
          <TextField
            label="Location Name"
            variant="outlined"
            fullWidth
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g., Teide Observatory, Tenerife"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Latitude"
                variant="outlined"
                fullWidth
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="28.300000"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Longitude"
                variant="outlined"
                fullWidth
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-16.510000"
                
              />
            </Grid>
          </Grid>

          {/* Metadata de cámara */}
          <TextField
            label="Camera"
            variant="outlined"
            fullWidth
            value={camera}
            onChange={(e) => setCamera(e.target.value)}
            placeholder="e.g., Canon EOS R5"
          />
          <TextField
            label="Lens"
            variant="outlined"
            fullWidth
            value={lens}
            onChange={(e) => setLens(e.target.value)}
            placeholder="e.g., 200-500mm f/5.6"
          />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="ISO"
                variant="outlined"
                fullWidth
                value={iso}
                onChange={(e) => setIso(e.target.value)}
                placeholder="3200"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Exposure"
                variant="outlined"
                fullWidth
                value={exposure}
                onChange={(e) => setExposure(e.target.value)}
                placeholder="1/250s"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Aperture"
                variant="outlined"
                fullWidth
                value={aperture}
                onChange={(e) => setAperture(e.target.value)}
                placeholder="f/5.6"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={!selectedFile || !title}
        >
          Add Image
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddImageDialog;