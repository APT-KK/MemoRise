import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Camera, Aperture, Clock, Gauge, Tag } from 'lucide-react';
import InteractionBar from '../components/InteractionBar';
import TaggingComp from '../components/Tagging';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Box,
    Container,
    Card,
    CardHeader,
    CardMedia,
    CardContent,
    Avatar,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DownloadIcon from '@mui/icons-material/Download';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const PhotoDetail = () => {
    const { id } = useParams();
    const [photo, setPhoto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTagCompOpen, setTagCompOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await api.get(`/api/gallery/photos/${id}/download/`, {
                responseType: 'blob' // treats file as binary large object(blob)
            });
            
            const blob = new Blob([response.data]); 
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const contentDisposition = response.headers['content-disposition'];
            let filename = `photo_${id}.jpg`; // fallback
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+?)"?$/);
                if (match) filename = match[1];
            }
            
            link.setAttribute('download', filename); // downloads instead of navigating
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Download started!');
        } catch (err) {
            console.error("Download failed", err);
            toast.error('Failed to download photo');
        } finally {
            setIsDownloading(false);
        }
    };
    
    useEffect(() => {
        const fetchSinglePhoto = async () => {
            try {
                const res = await api.get(`/api/gallery/photos/${id}/`);
                setPhoto(res.data);
            } catch (err) {
                console.error("Failed to load photo", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSinglePhoto();
    }, [id]);

    if (isLoading) return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: 'black' }} />
        </Box>
    );
    
    if (!photo) return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>Photo not found.</Typography>
        </Box>
    );

    let imageUrl = photo.image;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
    } else if (imageUrl && imageUrl.startsWith('http://127.0.0.1:8000')) {
        imageUrl = imageUrl.replace('http://127.0.0.1:8000', '');
    }

    // Fix profile picture URL as well
    let profilePicUrl = photo.photographer_profile_picture;
    if (profilePicUrl && !profilePicUrl.startsWith('http') && !profilePicUrl.startsWith('/')) {
        profilePicUrl = '/' + profilePicUrl;
    } else if (profilePicUrl && profilePicUrl.startsWith('http://127.0.0.1:8000')) {
        profilePicUrl = profilePicUrl.replace('http://127.0.0.1:8000', '');
    }

    // Fallback for date display!
    const dateString = new Date(photo.uploaded_at || photo.created_at || Date.now()).toLocaleDateString();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'white', py: 3, px: 2 }}>
            <Container maxWidth="xl">
                <Button
                    component={Link}
                    to="/home"
                    startIcon={<ArrowBackIcon />}
                    sx={{ 
                        mb: 2, 
                        color: 'black',
                        textTransform: 'none',
                        '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                    }}
                >
                    Back to Feed
                </Button>

                <Grid container spacing={3}>
                    {/* LEFT SIDE - Photo */}
                    <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                        <Card sx={{ borderRadius: 2, border: 1, borderColor: 'grey.300', overflow: 'hidden', height: 'fit-content' }}>
                            <CardHeader
                                avatar={
                                    <Avatar
                                        src={profilePicUrl}
                                        sx={{ 
                                            width: 40, 
                                            height: 40, 
                                            bgcolor: 'black'
                                        }}
                                    >
                                        <PersonIcon />
                                    </Avatar>
                                }
                                title={
                                    <Link 
                                        to={`/profile/${encodeURIComponent(photo.photographer_email || '')}`}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <Typography fontWeight="bold" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                                            {photo.photographer_email || "Unknown Photographer"}
                                        </Typography>
                                    </Link>
                                }
                                subheader={dateString}
                                sx={{ borderBottom: 1, borderColor: 'grey.200' }}
                            />

                            <Box sx={{ bgcolor: 'grey.50', display: 'flex', justifyContent: 'center' }}>
                                <CardMedia
                                    component="img"
                                    image={imageUrl}
                                    alt={photo.description || "Photo detail"}
                                    sx={{ 
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: '80vh',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>

                            {/* Description under photo */}
                            {photo.description && (
                                <CardContent sx={{ py: 2, px: 3 }}>
                                    <Typography variant="body1">
                                        {photo.description}
                                    </Typography>
                                </CardContent>
                            )}
                        </Card>
                    </Grid>

                    {/* RIGHT SIDE - Interactions, Tags, EXIF, Download */}
                    <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: { md: 'sticky' }, top: { md: 24 } }}>
                            {/* Likes & Comments */}
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <InteractionBar 
                                    photoId={photo.id} 
                                    initialLikesCount={photo.likes_count} 
                                    initialLiked={photo.is_liked} 
                                />
                            </Paper>

                            {/* Download Button */}
                            <Button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                variant="contained"
                                fullWidth
                                startIcon={isDownloading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <DownloadIcon />}
                                sx={{ 
                                    bgcolor: 'black',
                                    py: 1.5,
                                    '&:hover': { bgcolor: 'grey.800' },
                                    '&:disabled': { opacity: 0.5 }
                                }}
                            >
                                {isDownloading ? 'Downloading...' : 'Download Photo'}
                            </Button>

                            {/* Tags Section */}
                            {((photo.manual_tags && photo.manual_tags.length > 0) || (photo.auto_tags && photo.auto_tags.length > 0)) && (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="overline" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                                        Tags
                                    </Typography>
                                    
                                    {photo.manual_tags && photo.manual_tags.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                            {photo.manual_tags.map((tag: string, idx: number) => (
                                                <Chip
                                                    key={"manual-"+idx}
                                                    icon={<Tag className="w-3 h-3" />}
                                                    label={tag}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderColor: 'black' }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    {photo.auto_tags && photo.auto_tags.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {photo.auto_tags.map((tag: string, idx: number) => (
                                                <Chip
                                                    key={"auto-"+idx}
                                                    icon={<Tag className="w-3 h-3" />}
                                                    label={tag}
                                                    size="small"
                                                    sx={{ bgcolor: 'grey.100' }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Paper>
                            )}

                            {/* People Tagged Section */}
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="overline" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                                    People Tagged
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {photo.tagged_users_details && photo.tagged_users_details.length > 0 ? (
                                        photo.tagged_users_details.map((user: { id: number; full_name?: string; email: string }) => (
                                            <Chip
                                                key={user.id}
                                                icon={<PersonIcon sx={{ fontSize: 16 }} />}
                                                label={user.full_name || user.email}
                                                size="small"
                                                sx={{ bgcolor: 'primary.50', color: 'primary.main', borderColor: 'primary.200' }}
                                                variant="outlined"
                                            />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No one tagged yet
                                        </Typography>
                                    )}
                                </Box>

                                <Button
                                    onClick={() => setTagCompOpen(true)}
                                    size="small"
                                    startIcon={<PersonAddIcon />}
                                    variant="contained"
                                    fullWidth
                                    sx={{ 
                                        bgcolor: 'black', 
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'grey.800' }
                                    }}
                                >
                                    Tag People
                                </Button>
                            </Paper>

                            {/* EXIF Data Section */}
                            {photo.exif_data && Object.keys(photo.exif_data).length > 0 && (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography 
                                        variant="overline" 
                                        fontWeight="bold" 
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                                    >
                                        <CameraAltIcon fontSize="small" /> Technical Details
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                        {photo.exif_data.Model && (
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                    Camera
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {photo.exif_data.Model}
                                                </Typography>
                                            </Grid>
                                        )}
                                        {photo.exif_data.FNumber && (
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                    Aperture
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Aperture className="w-3.5 h-3.5" /> f/{photo.exif_data.FNumber}
                                                </Typography>
                                            </Grid>
                                        )}
                                        {photo.exif_data.ISOSpeedRatings && (
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                    ISO
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Gauge className="w-3.5 h-3.5" /> {photo.exif_data.ISOSpeedRatings}
                                                </Typography>
                                            </Grid>
                                        )}
                                        {photo.exif_data.ExposureTime && (
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                    Shutter
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Clock className="w-3.5 h-3.5" /> {photo.exif_data.ExposureTime}s
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {photo && (
                <TaggingComp 
                    photo={photo} 
                    isOpen={isTagCompOpen} 
                    onClose={() => setTagCompOpen(false)}
                    onUpdate={(updatedPhoto) => setPhoto(updatedPhoto)}
                />
            )}
        </Box>
    );
};

export default PhotoDetail;