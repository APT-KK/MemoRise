import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Card, CardContent, CardMedia, Grid, Alert } from '@mui/material';
import api from '../api/axios';

const SharedAlbumPage: React.FC = () => {
  const { share_token } = useParams<{ share_token: string }>();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/gallery/albums/${share_token}/`);
        setAlbum(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load album.');
      } finally {
        setLoading(false);
      }
    };
    if (share_token) fetchAlbum();
  }, [share_token]);

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  if (!album) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', py: 3, px: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {album.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {album.description || 'No description'}
      </Typography>
      <Grid container spacing={2}>
        {album.photos && album.photos.length > 0 ? (
          album.photos.map((photo: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="180"
                  image={photo.image}
                  alt={photo.title || 'Photo'}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {photo.title || 'Untitled'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">No photos in this album.</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SharedAlbumPage;
