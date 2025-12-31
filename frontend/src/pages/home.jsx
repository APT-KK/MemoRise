import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, MapPin, LogOut, User, Camera, CalendarPlus, Loader2 } from 'lucide-react'; 
import toast from 'react-hot-toast';
import NotificationBell from '../components/NotificationBell';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/gallery/events/');
                // this handles pagination results or direct array
                setEvents(res.data.results || res.data);

                try {
                    const userRes = await api.get('/api/auth/users/me/');
                    setCurrentUser(userRes.data);
                } catch (userErr) {
                    console.warn("User not logged in or fetch failed", userErr);
                }

            } catch (err) {
                console.error("Failed to load events", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-white mx-auto" />
                    <p className="mt-4 text-gray-400">Loading events...</p>
                </div>
            </div>
        );
    }

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

                    <Link 
                        to="/create-event"
                        className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-900 transition font-medium border border-black"
                    >
                        <CalendarPlus className="w-5 h-5" />
                        <span>Create New Event</span>
                    </Link>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-20 bg-gray-100 rounded-lg border border-dashed border-black/20">
                        <div className="bg-black/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-black/20">
                            <Calendar className="h-10 w-10 text-black/50" />
                        </div>
                        <h2 className="text-xl font-semibold text-black">No events found</h2>
                        <p className="text-gray-600 mt-2">Get started by creating your first event above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <Link to={`/event/${event.id}`} key={event.id} className="group h-full block">
                                <div className="bg-gray-100 rounded-lg border border-black/10 hover:border-black/30 transition-all duration-300 overflow-hidden h-full flex flex-col">
                                    
                                    <div className="h-56 bg-gray-200 relative overflow-hidden">
                                        {event.cover_photo || event.cover_image ? (
                                            <img 
                                                src={event.cover_photo || event.cover_image} 
                                                alt={event.title || event.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-black/20 bg-gray-200">
                                                <Calendar className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30" />
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                                            {event.title || event.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                                            {event.description || <span className="italic opacity-50">No description provided.</span>}
                                        </p>
                                        
                                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-black/10 mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{event.date}</span>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>{event.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;