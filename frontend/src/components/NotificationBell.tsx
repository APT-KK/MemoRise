import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { formatDistanceToNow } from 'date-fns';
import {
    IconButton,
    Badge,
    Popover,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Box,
    Button
} from '@mui/material';

const NotificationBell = () => {
    const { notifications, unreadCount, markAllAsRead } = useWebSocket();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();

    // this will open the popover and mark all as read
    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        markAllAsRead();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // navigate to the resource from the notif
    const handleNotificationClick = (notif: any) => {
        if (notif.resource_id) {
            handleClose();
            navigate(`/photos/${notif.resource_id}`);
        }
    };

    const open = Boolean(anchorEl);
    const id = open ? 'notification-popover' : undefined;

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen} aria-describedby={id} size="large">
                <Badge badgeContent={unreadCount > 9 ? '9+' : unreadCount} color="error" invisible={unreadCount === 0}>
                    <Bell className="w-6 h-6" />
                </Badge>
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { width: 350, maxWidth: '90vw', p: 0 } }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'grey.200', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
                    <Typography variant="caption" color="text.secondary">{notifications.length} Recent</Typography>
                </Box>
                <List sx={{ maxHeight: 400, overflowY: 'auto', p: 0 }}>
                    {notifications.length === 0 ? (
                        <ListItem>
                            <ListItemText primary={<Typography color="text.secondary">No new notifications</Typography>} />
                        </ListItem>
                    ) : (
                        notifications.map((notif, index) => {
                            const isButton = !!notif.resource_id;
                            return (
                                <ListItem
                                    key={index}
                                    {...(isButton ? { button: true } : {})}
                                    onClick={isButton ? () => handleNotificationClick(notif) : undefined}
                                    alignItems="flex-start"
                                    sx={{ borderBottom: 1, borderColor: 'grey.100', cursor: isButton ? 'pointer' : 'default' }}
                                >
                                <ListItemAvatar>
                                    {notif.target?.image ? (
                                        <Avatar src={notif.target.image.startsWith('http') ? notif.target.image : `http://127.0.0.1:8000${notif.target.image}`} alt="preview" />
                                    ) : (
                                        <Avatar sx={{ bgcolor: 'black' }}>
                                            <Bell className="w-5 h-5" />
                                        </Avatar>
                                    )}
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <span>
                                            <Typography component="span" fontWeight="bold" variant="body2">
                                                {notif.actor_name || notif.actor?.full_name}
                                            </Typography>
                                            {' '}{notif.message || notif.verb}
                                        </span>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {notif.created_at
                                                ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })
                                                : "Just now"}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        );
                        })
                    )}
                </List>
                <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Button onClick={handleClose} size="small" color="primary">Close</Button>
                </Box>
            </Popover>
        </>
    );
};

export default NotificationBell;