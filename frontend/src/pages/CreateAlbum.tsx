import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CoverImagePicker from '../components/CoverImagePicker';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CreateAlbum = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preSelectedEventId = searchParams.get('event');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);

    useEffect(() => {
    }, [preSelectedEventId]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!preSelectedEventId) {
            toast.error("No event specified for this album.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('event', preSelectedEventId); 
        if (coverFile) {
            formData.append('cover_image', coverFile);
        }

        try {
            await api.post('/api/gallery/albums/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Album created successfully!');
            navigate(`/event/${preSelectedEventId}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create album.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                py: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Box sx={{ mb: 3 }}>
                        <Link
                            href="/home"
                            underline="hover"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                color: 'text.primary',
                                fontWeight: 500,
                            }}
                        >
                            <ArrowBackIcon fontSize="small" /> Back to Home
                        </Link>
                    </Box>

                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Create New Album
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Organize photos within an event
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <CoverImagePicker
                                label="Album Cover Image"
                                onImageSelect={(file: File | null) => setCoverFile(file)}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Album Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Wedding Ceremony, After Party"
                            required
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this album about?"
                            multiline
                            rows={3}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                bgcolor: 'black',
                                '&:hover': { bgcolor: 'grey.800' },
                            }}
                        >
                            {loading && <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />}
                            {loading ? 'Creating Album...' : 'Create Album'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default CreateAlbum;