import { useState, FormEvent } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CoverImagePicker from './CoverImagePicker';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    IconButton,
    Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CreateEventDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateEventDialog = ({ open, onClose, onSuccess }: CreateEventDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDate('');
        setLocation('');
        setCoverFile(null);
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

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
            resetForm();
            onClose();
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }} // To paper props(underneath screen)
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1,
                }}
            >
                <Typography variant="h5" fontWeight="bold">
                    Create New Event
                </Typography>
                <IconButton onClick={handleClose} disabled={loading}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent dividers>
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
                    />
                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={handleClose} disabled={loading} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            px: 4,
                            bgcolor: 'black',
                            '&:hover': { bgcolor: 'grey.800' },
                        }}
                    >
                        {loading && <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />}
                        {loading ? 'Creating...' : 'Create Event'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default CreateEventDialog;
