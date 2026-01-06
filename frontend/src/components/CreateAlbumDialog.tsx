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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CreateAlbumDialogProps {
    open: boolean;
    onClose: () => void;
    eventId: string | number;
    onSuccess?: () => void;
}

const CreateAlbumDialog = ({ open, onClose, eventId, onSuccess }: CreateAlbumDialogProps) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const resetForm = () => {
        setName('');
        setDescription('');
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

        if (!eventId) {
            toast.error("No event specified for this album.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('event', String(eventId));
        if (coverFile) {
            formData.append('cover_image', coverFile);
        }

        try {
            await api.post('/api/gallery/albums/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Album created successfully!');
            resetForm();
            onClose();
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create album.');
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
            sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1,
                }}
            >
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Create New Album
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Organize photos within an event
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} disabled={loading}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent dividers>
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
                        {loading ? 'Creating...' : 'Create Album'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default CreateAlbumDialog;
