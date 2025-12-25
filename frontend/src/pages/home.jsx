import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, MapPin, LogOut, User, Camera } from 'lucide-react'; 
import toast from 'react-hot-toast';


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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading photos...</p>
                </div>
            </div>
        );
    }

  return (
        <div className="min-h-screen bg-gray-50">

            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/home" className="flex items-center gap-3">
                            <Camera className="h-6 w-6 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">MEMORISE</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {currentUser && (
                                <Link to="/my-profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                                    <User className="h-5 w-5" />
                                    <span className="hidden sm:inline">Profile</span>
                                </Link>
                            )}
                            
                            <button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-2"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-end mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-20">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600">No events found</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <Link to={`/event/${event.id}`} key={event.id} className="group h-full">
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                                    
                                    <div className="h-56 bg-gray-200 relative overflow-hidden">
                                        {event.cover_image ? (
                                            <img 
                                                src={event.cover_image} 
                                                alt={event.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                                <Calendar className="h-10 w-10 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                                            {event.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                                            {event.description || "No description."}
                                        </p>
                                        
                                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100 mt-auto">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{event.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{event.location}</span>
                                            </div>
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