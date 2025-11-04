import { Grid, Card, CardMedia, CardContent, Typography } from "@mui/material";

function ImageGrid({ images }) {
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
    <Grid container spacing={3}>
      {images.map((image) => (
        <Grid item xs={12} sm={6} md={4} lg={1} key={image.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={image.preview}
              alt={image.title}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {image.title || ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {image.description || ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default ImageGrid;
