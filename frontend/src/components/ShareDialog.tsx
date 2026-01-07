import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Tooltip,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string | null;
  isPublic: boolean;
  onTogglePublic: () => Promise<void>;
  loading?: boolean;
  type?: 'album' | 'photo';
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  shareUrl,
  isPublic,
  onTogglePublic,
  loading = false,
  type = 'album',
}) => {
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Share {type === 'album' ? 'Album' : 'Photo'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {isPublic
            ? `Anyone with this link can view this ${type}.`
            : `This ${type} is private. Enable sharing to get a public link.`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <TextField
            value={shareUrl || ''}
            label="Shareable Link"
            fullWidth
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Tooltip title="Copy Link">
                  <span>
                    <IconButton
                      onClick={handleCopy}
                      disabled={!shareUrl}
                      size="small"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              ),
            }}
            variant="outlined"
            size="small"
          />
        </Box>
        <Alert severity={isPublic ? 'success' : 'info'} sx={{ mb: 2 }}>
          {isPublic
            ? `This ${type} is public. You can disable sharing at any time.`
            : `This ${type} is private. Enable sharing to generate a link.`}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onTogglePublic}
          color={isPublic ? 'error' : 'primary'}
          variant={isPublic ? 'outlined' : 'contained'}
          disabled={loading}
        >
          {isPublic ? 'Disable Sharing' : 'Enable Sharing'}
        </Button>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Link copied!
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ShareDialog;
