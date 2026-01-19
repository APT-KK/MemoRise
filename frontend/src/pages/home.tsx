import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, MapPin, LogOut, User, Camera, CalendarPlus, Search } from 'lucide-react'; 
import { Button, IconButton, Tooltip } from '@mui/material';
import toast from 'react-hot-toast';
import NotificationBell from '../components/NotificationBell';
import CreateEventDialog from '../components/CreateEventDialog';
import { Event, User as UserType } from '../types';
import { AxiosError } from 'axios';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Grid,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Home: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [createEventOpen, setCreateEventOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/gallery/events/');
                // this handles pagination results or direct array
                // Always flatten paginated results to show all events
                let eventsArr = res.data;
                if (Array.isArray(eventsArr)) {
                    setEvents(eventsArr);
                } else if (Array.isArray(eventsArr.results)) {
                    let allResults = [...eventsArr.results];
                    let next = eventsArr.next;
                    // Use a for-loop with await for proper async handling
                    for (let i = 0; next; i++) {
                        const url = next.startsWith('http') ? next : `${window.location.origin}${next}`;
                        // eslint-disable-next-line no-await-in-loop
                        const nextRes = await api.get(url);
                        allResults = allResults.concat(nextRes.data.results || []);
                        next = nextRes.data.next;
                    }
                    setEvents(allResults);
                } else {
                    setEvents([]);
                }

                try {
                    const userRes = await api.get('/api/auth/users/me/');
                    setCurrentUser(userRes.data);
                } catch (userErr) {
                    console.warn("User not logged in or fetch failed", userErr);
                }

            } catch (err) {
                console.error("Failed to load events", err);
                const axiosError = err as AxiosError;
                if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                    toast.error("Please log in to view the events");
                    navigate('/login');
                } else {
                    toast.error("Failed to load events. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        if (!window.confirm('Are you sure you want to log out?')) return;
        setLogoutLoading(true);
        setTimeout(() => {
            localStorage.removeItem('authTokens');
            setLogoutLoading(false);
            toast.success('Logged out successfully');
            navigate('/');
        }, 800); 
    };

  return (
        <div className="min-h-screen bg-white text-black">
            <header className="bg-white border-b border-black/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/home" className="flex items-center gap-3 group">
                            <div className="p-2 rounded-lg group-hover:bg-black/10 transition-colors border border-black/20">
                                <Camera className="h-6 w-6 text-black" />
                            </div>
                            <span className="text-2xl font-bold text-black tracking-tight">MEMORISE</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link to="/search" className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors">
                                <div className="bg-black/10 p-2 rounded-full border border-black/20">
                                    <Search className="h-5 w-5 text-black" />
                                </div>
                                <span className="hidden sm:inline font-medium">Search</span>
                            </Link>

                            {currentUser && (
                                <Link to="/my-profile" className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors">
                                    <div className="bg-black/10 p-2 rounded-full border border-black/20">
                                        <User className="h-5 w-5 text-black" />
                                    </div>
                                    <span className="hidden sm:inline font-medium">Profile</span>
                                </Link>
                            )}

                            <NotificationBell />
                            
                            <button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                className="text-white hover:bg-black/10 px-3 py-2 rounded-lg transition flex items-center gap-2 border border-black/20 hover:border-black/40 disabled:opacity-50"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 border-b border-black/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-black">Your Events</h1>
                        <p className="text-gray-600 mt-1">Manage specific collections and albums</p>
                    </div>

                    {/* <button 
                        onClick={() => setCreateEventOpen(true)}
                        className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-900 transition font-medium border border-black"
                    >
                        <CalendarPlus className="w-5 h-5" />
                        <span>Create New Event</span>
                    </button> */}

                    <Button
                        onClick={() => setCreateEventOpen(true)}
                        startIcon={<CalendarPlus className="w-5 h-5" />}
                        variant="contained"
                        sx={{ bgcolor: 'black', color: 'white', textTransform: 'none', px: 3, py: 1.5, borderRadius: 2, fontWeight: 500, '&:hover': { bgcolor: 'grey.900' } }}
                    >
                        Create New Event
                    </Button>
                    <CreateEventDialog
                        open={createEventOpen}
                        onClose={() => setCreateEventOpen(false)}
                        onSuccess={async () => {
                            // Refresh events list
                            const res = await api.get('/api/gallery/events/');
                            let eventsArr = res.data;
                            if (Array.isArray(eventsArr)) {
                                setEvents(eventsArr);
                            } else if (Array.isArray(eventsArr.results)) {
                                let allResults = [...eventsArr.results];
                                let next = eventsArr.next;
                                for (let i = 0; next; i++) {
                                    const url = next.startsWith('http') ? next : `${window.location.origin}${next}`;
                                    const nextRes = await api.get(url);
                                    allResults = allResults.concat(nextRes.data.results || []);
                                    next = nextRes.data.next;
                                }
                                setEvents(allResults);
                            } else {
                                setEvents([]);
                            }
                        }}
                    />
                </div>

                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <CircularProgress size={48} sx={{ color: 'black' }} />
                        <Typography color="text.secondary" sx={{ mt: 2 }}>Loading events...</Typography>
                    </Box>
                ) : events.length === 0 ? (
                    <Box 
                        sx={{ 
                            textAlign: 'center', 
                            py: 10, 
                            bgcolor: 'grey.100', 
                            borderRadius: 2, 
                            border: '1px dashed',
                            borderColor: 'grey.300'
                        }}
                    >
                        <Box 
                            sx={{ 
                                width: 80, 
                                height: 80, 
                                borderRadius: '50%', 
                                bgcolor: 'grey.200',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}
                        >
                            <EventIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">No events found</Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Get started by creating your first event above.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {events.map((event) => (
                            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
                                <Link to={`/event/${event.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                                    <Card 
                                        sx={{ 
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 2,
                                            border: 1,
                                            borderColor: 'grey.200',
                                            transition: 'all 0.3s',
                                            '&:hover': { 
                                                boxShadow: 4,
                                                borderColor: 'grey.400',
                                                '& .event-cover': { transform: 'scale(1.05)' }
                                            }
                                        }}
                                    >
                                        <Box sx={{ height: 220, position: 'relative', overflow: 'hidden', bgcolor: 'grey.200' }}>
                                            {event.cover_photo || event.cover_image ? (
                                                <CardMedia
                                                    component="img"
                                                    image={event.cover_photo || event.cover_image}
                                                    alt={event.title || event.name}
                                                    className="event-cover"
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
                                                    <EventIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                                                </Box>
                                            )}
                                            <Box 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    inset: 0, 
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
                                                    pointerEvents: 'none'
                                                }} 
                                            />
                                        </Box>

                                        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                                {event.title || event.name}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    flexGrow: 1,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {event.description || <em style={{ opacity: 0.5 }}>No description provided.</em>}
                                            </Typography>
                                            
                                            <Box 
                                                sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 3, 
                                                    pt: 2, 
                                                    borderTop: 1, 
                                                    borderColor: 'grey.200',
                                                    mt: 'auto'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <EventIcon sx={{ fontSize: 16, color: 'grey.500' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {event.date}
                                                    </Typography>
                                                </Box>
                                                {event.location && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <LocationOnIcon sx={{ fontSize: 16, color: 'grey.500' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {event.location}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </main>
        </div>
    );
};

export default Home;