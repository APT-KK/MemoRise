import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Card, CardContent, CardMedia, Alert } from '@mui/material';
import api from '../api/axios';

const SharedPhotoPage: React.FC = () => {
  const { share_token } = useParams<{ share_token: string }>();
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/share/photos/${share_token}/`);
        setPhoto(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load photo.');
      } finally {
        setLoading(false);
      }
    };
    if (share_token) fetchPhoto();
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

  if (!photo) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', py: 3, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardMedia
          component="img"
          height="400"
          image={photo.image}
          alt={photo.title || 'Photo'}
        />
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {photo.title || 'Untitled'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {photo.description || 'No description'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Photographer: {photo.photographer_name || 'Unknown'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SharedPhotoPage;
