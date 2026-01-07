import { Link } from 'react-router-dom';
import { Album } from '../types';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ShareIcon from '@mui/icons-material/Share';
import ShareDialog from './ShareDialog';
import { IconButton } from '@mui/material';
import api from '../api/axios';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface AlbumCardProps {
    album: Album;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(album.is_public ? `${window.location.origin}/share/${album.share_token}` : null);
    const [isPublic, setIsPublic] = useState(!!album.is_public);

    const handleTogglePublic = async () => {
        setShareLoading(true);
        try {
            const res = await api.post(`/api/gallery/albums/${album.id}/share/`);
            setIsPublic(res.data.is_public);
            setShareUrl(res.data.share_token ? `${window.location.origin}/share/${res.data.share_token}` : null);
        } catch (err) {
            toast.error("Failed to toggle public link.");
        } finally {
            setShareLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ position: 'relative' }}>
                <Link to={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
                    <Card 
                        sx={{ 
                            borderRadius: 2,
                            border: 1,
                            borderColor: 'grey.300',
                            transition: 'all 0.3s',
                            '&:hover': { 
                                boxShadow: 4,
                                '& .album-cover': { transform: 'scale(1.05)' },
                                '& .album-title': { textDecoration: 'underline' }
                            }
                        }}
                    >
                        <Box sx={{ height: 160, position: 'relative', overflow: 'hidden', bgcolor: 'black' }}>
                            {album.cover_image ? (
                                <CardMedia
                                    component="img"
                                    image={album.cover_image}
                                    alt={album.name}
                                    className="album-cover"
                                    sx={{
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s',
                                    }}
                                />
                            ) : (
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        height: '100%' 
                                    }}
                                >
                                    <FolderIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)' }} />
                                </Box>
                            )}
                            <Chip
                                icon={<PhotoLibraryIcon sx={{ fontSize: 14 }} />}
                                label={album.photos?.length || 0}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'rgba(0,0,0,0.8)',
                                    color: 'white',
                                    backdropFilter: 'blur(4px)',
                                    '& .MuiChip-icon': { color: 'white' }
                                }}
                            />
                            <IconButton
                                aria-label="Share album"
                                onClick={e => { e.preventDefault(); setShareDialogOpen(true); }}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    bgcolor: 'rgba(255,255,255,0.8)',
                                    '&:hover': { bgcolor: 'primary.100' },
                                    zIndex: 2
                                }}
                            >
                                <ShareIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <CardContent sx={{ p: 2 }}>
                            <Typography 
                                variant="subtitle1" 
                                fontWeight="bold"
                                className="album-title"
                                sx={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {album.name}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}
                            >
                                {album.description || "No description"}
                            </Typography>
                        </CardContent>
                    </Card>
                </Link>
            </Box>
            <ShareDialog
                open={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
                shareUrl={shareUrl}
                isPublic={isPublic}
                loading={shareLoading}
                type="album"
                onTogglePublic={handleTogglePublic}
            />
        </>
    );
};

export default AlbumCard;