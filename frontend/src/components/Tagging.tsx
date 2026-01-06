import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    Typography,
    IconButton,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Button,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';

interface User {
    id: number;
    full_name?: string;
    email: string;
}

interface Photo {
    id: number;
    tagged_users_details?: User[];
}

interface TaggingCompProps {
    photo: Photo;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (data: Photo) => void;
}

const TaggingComp = ({ photo, isOpen, onClose, onUpdate }: TaggingCompProps) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>(
        photo.tagged_users_details ? photo.tagged_users_details.map(u => u.id) : []
    ); // to send ids to backend
    const [isSaving, setIsSaving] = useState(false);

    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(photo.tagged_users_details ? photo.tagged_users_details.map(u => u.id) : []);
            setQuery('');
            setSearchResults([]);
        }
    }, [isOpen, photo.tagged_users_details]);

    // this will search users via the query
    useEffect(() => {
        const findUsers = setTimeout(async () => {
            if (query.length >= 2) {
                try {
                    const res = await api.get(`/api/gallery/search/?q=${query}`);
                    const users = Array.isArray(res.data.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
                    setSearchResults(users);
                } catch (err) {
                    console.error("Search failed", err);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); 
        // we use Timeout to prevent Debouncing(API spamming)

        return () => clearTimeout(findUsers);
    }, [query]);

    const toggleUser = (userId: number) => {
        setSelectedIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId) //untag user
                : [...prev, userId]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = { tagged_user_ids: selectedIds };
            const res = await api.patch(`/api/gallery/photos/${photo.id}/`, payload);
            onUpdate(res.data);
            onClose();
        } catch (err) {
            alert("Failed to update tags");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
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
                <Typography component="h2" variant="h6" fontWeight="bold">
                    Tag People
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'grey.200' }}>
                    <TextField
                        fullWidth
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'grey.500' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                <List sx={{ maxHeight: 256, overflow: 'auto', p: 1.5 }}>
                    {searchResults.length === 0 && query.length > 2 && (
                        <Typography color="text.secondary" textAlign="center" py={3}>
                            No users found.
                        </Typography>
                    )}
                    {searchResults.map(user => {
                        const isSelected = selectedIds.includes(user.id);
                        return (
                            <ListItemButton
                                key={user.id}
                                onClick={() => toggleUser(user.id)}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.5,
                                    border: 1,
                                    borderColor: isSelected ? 'black' : 'transparent',
                                    bgcolor: isSelected ? 'grey.100' : 'transparent',
                                    '&:hover': {
                                        bgcolor: isSelected ? 'grey.200' : 'grey.100',
                                    },
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'black', color: 'white', fontWeight: 'bold' }}>
                                        {(user.full_name ? user.full_name[0] : user.email[0]).toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={user.full_name || user.email}
                                    secondary={user.email}
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                    secondaryTypographyProps={{ color: 'text.secondary', fontSize: '0.75rem' }}
                                />
                                {isSelected ? (
                                    <CheckIcon sx={{ color: 'black' }} />
                                ) : (
                                    <PersonAddIcon sx={{ color: 'grey.500' }} />
                                )}
                            </ListItemButton>
                        );
                    })}
                </List>
            </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: 'space-between',
                    p: 2.5,
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    {selectedIds.length} person{selectedIds.length !== 1 && 's'} selected
                </Typography>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="contained"
                    sx={{
                        px: 4,
                        bgcolor: 'black',
                        '&:hover': { bgcolor: 'grey.800' },
                    }}
                >
                    {isSaving ? <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} /> : null}
                    {isSaving ? 'Saving...' : 'Done'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaggingComp;