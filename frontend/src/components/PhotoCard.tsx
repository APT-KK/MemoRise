import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import InteractionBar from './InteractionBar';
import { Photo } from '../types';
import {
    Card,
    CardHeader,
    CardMedia,
    CardContent,
    Avatar,
    Typography,
    Box,
    CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface PhotoCardProps {
    photo: Photo & { photographer_profile_picture?: string };
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo: initialPhoto }) => {
    const [photo, setPhoto] = useState(initialPhoto);

    const isProcessing = photo.is_processed !== true;

    // polling logic
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isProcessing) {
            intervalId = setInterval(async () => {
                try {

                    let accessToken = null;
                    const authTokensString = localStorage.getItem('authTokens');
                    if (authTokensString) {
                        try {
                            const tokens = JSON.parse(authTokensString);
                            accessToken = tokens.access;
                        } catch (e) {
                            accessToken = authTokensString;
                        }
                    }
                    if (!accessToken) accessToken = localStorage.getItem('access');

                    // Poll the API to update photo status
                    // We use the relative URL to work with Vite proxy, or fallback to absolute if needed
                    const pollUrl = `http://localhost:8000/api/gallery/photos/${photo.id}/?_=${Date.now()}`;
                    const response = await axios.get(pollUrl, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });

                    const serverIsProcessed = response.data.is_processed === true || response.data.isProcessed === true;

                    if (serverIsProcessed) {
                        setPhoto(prev => ({
                            ...prev,
                            ...response.data,
                            is_processed: true
                        }));
                        clearInterval(intervalId);
                    }
                } catch (error) {
                }
            }, 3000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isProcessing, photo.id]);

    let imageUrl = photo.thumbnail || photo.image;

    if (imageUrl) {
        // normalize URL paths
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = '/' + imageUrl;
        } else if (imageUrl.startsWith('http://127.0.0.1:8000')) {
            imageUrl = imageUrl.replace('http://127.0.0.1:8000', '');
        }

        //DEBUG: Cache Busting: Force browser to re-fetch image after processing finishes
        if (!isProcessing) {
            const timestamp = photo.updated_at ? new Date(photo.updated_at).getTime() : Date.now();
            imageUrl = `${imageUrl}?t=${timestamp}`;
        }
    }

    const photographerEmail = photo.photographer_email || "Unknown User";

    return (
        <Card
            sx={{
                borderRadius: 2,
                border: 1,
                borderColor: 'grey.300',
                transition: 'all 0.3s',
                '&:hover': {
                    boxShadow: 4,
                    '& .photo-image': { transform: 'scale(1.05)' }
                }
            }}
        >
            <CardHeader
                avatar={
                    <Avatar
                        src={photo.photographer_profile_picture}
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'black',
                            border: 1,
                            borderColor: 'grey.300'
                        }}
                    >
                        <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                }
                title={
                    <Link
                        to={`/profile/${encodeURIComponent(photographerEmail)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{
                                '&:hover': { textDecoration: 'underline' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {photographerEmail}
                        </Typography>
                    </Link>
                }
                sx={{ py: 1.5, px: 2, borderBottom: 1, borderColor: 'grey.200' }}
            />

            <Link to={`/photos/${photo.id}`} style={{ display: 'block' }}>
                <Box sx={{ position: 'relative', aspectRatio: '1', bgcolor: 'black', overflow: 'hidden' }}>
                    {isProcessing && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            <CircularProgress size={32} sx={{ color: 'white', mb: 1 }} />
                            <Typography variant="caption" sx={{ color: 'white', px: 1.5, py: 0.5, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 2 }}>
                                Processing...
                            </Typography>
                        </Box>
                    )}
                    <CardMedia
                        component="img"
                        image={imageUrl}
                        alt={photo.description || "Gallery Photo"}
                        className="photo-image"
                        sx={{
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s',
                            filter: isProcessing ? 'blur(8px)' : 'none',
                        }}
                    />
                </Box>
            </Link>

            <CardContent sx={{ p: 2 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        height: 40,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}
                >
                    {photo.description || ''}
                </Typography>

                <Box sx={{ pt: 2, borderTop: 1, borderColor: 'grey.200' }}>
                    <InteractionBar
                        photoId={photo.id}
                        initialLikesCount={photo.likes_count}
                        initialLiked={photo.is_liked}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default PhotoCard;