import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', title);
        formData.append('description', description);
        formData.append('date', date);
        formData.append('location', location);
        if (coverFile) {
            formData.append('cover_image', coverFile);
        }

        try {
            await api.post('/api/gallery/events/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Event created successfully!');
            navigate('/home');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create event.');
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

                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
                        Create New Event
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <CoverImagePicker
                                label="Event Cover Image"
                                onImageSelect={(file: File | null) => setCoverFile(file)}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Event Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Summer Music Festival"
                            required
                            sx={{ mb: 3 }}
                        />

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    slotProps={{
                                        inputLabel: { shrink: true },
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Central Park, NY"
                                    required
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the event..."
                            multiline
                            rows={4}
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
                            {loading ? 'Creating Event...' : 'Create Event'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default CreateEvent;