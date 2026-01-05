import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    Search, Calendar, User, 
    Camera, LogOut, Loader2,
    ArrowLeft, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationBell from '../components/NotificationBell';

const SearchPage = () => {
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        event_name: '',
        photographer: '',
        tagged_user: '',
        date_min: '',
        date_max: ''
    });

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userRes = await api.get('/api/auth/users/me/');
                setCurrentUser(userRes.data);
            } catch (err) {
                console.warn("User not logged in", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    navigate('/login');
                }
            }
        };
        fetchUser();
    }, [navigate]); // just checking if authenticated on mount

    const handleInputChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Build Query and Fetch
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);

        try {
            const params = new URLSearchParams(); // inbuilt query url constructor
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key]);
            });

            const response = await api.get(`/api/gallery/photos/?${params.toString()}`);
            setResults(response.data.results || response.data);

        } catch (error) {
            console.error("Search failed", error);
            toast.error("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            event_name: '',
            photographer: '',
            tagged_user: '',
            date_min: '',
            date_max: ''
        });
        setResults([]);
        setHasSearched(false);
    };

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
]            <header className="bg-white border-b border-black/10 sticky top-0 z-50">
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
                                className="bg-black text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition flex items-center gap-2 border border-black disabled:opacity-50"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link 
                        to="/home" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                        <Search className="w-8 h-8" />
                        Find Photos
                    </h1>
                    <p className="text-gray-600 mt-1">Search photos by event, photographer, tagged users, or date</p>
                </div>

                <div className="bg-white border border-black rounded-lg p-6 mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Calendar size={16} />
                                    Event Name
                                </label>
                                <input
                                    name="event_name"
                                    value={filters.event_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Wedding, Conference"
                                    className="w-full bg-gray-50 border border-black rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none transition"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <User size={16} />
                                    Tagged Person
                                </label>
                                <input
                                    name="tagged_user"
                                    value={filters.tagged_user}
                                    onChange={handleInputChange}
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-gray-50 border border-black rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none transition"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Camera size={16} />
                                    Photographer
                                </label>
                                <input
                                    name="photographer"
                                    value={filters.photographer}
                                    onChange={handleInputChange}
                                    placeholder="Photographer name"
                                    className="w-full bg-gray-50 border border-black rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none transition"
                                />
                            </div>

                            <div className="space-y-2 lg:col-span-3">
                                <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Calendar size={16} />
                                    Date Range
                                </label>
                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                    <input
                                        type="date"
                                        name="date_min"
                                        value={filters.date_min}
                                        onChange={handleInputChange}
                                        className="bg-gray-50 border border-black rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-black outline-none transition"
                                    />
                                    <span className="font-bold text-gray-500">TO</span>
                                    <input
                                        type="date"
                                        name="date_max"
                                        value={filters.date_max}
                                        onChange={handleInputChange}
                                        className="bg-gray-50 border border-black rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-black outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4 border-t border-gray-200 pt-6">
                            <button 
                                type="button" 
                                onClick={clearFilters} 
                                className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition border border-black"
                            >
                                Clear All
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="bg-black text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-gray-900 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Search
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
                        <p className="text-gray-600">Searching photos...</p>
                    </div>
                ) : (
                    <div>
                        {results.length > 0 ? (
                            <>
                                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-black/10">
                                    <ImageIcon className="w-5 h-5" />
                                    <h2 className="text-xl font-semibold">
                                        Results
                                        <span className="text-gray-500 font-normal ml-2">({results.length} photos found)</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {results.map(photo => {
                                        let imgUrl = photo.thumbnail || photo.image;
                                        if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
                                            imgUrl = '/' + imgUrl;
                                        }

                                        return (
                                            <Link
                                                to={`/photos/${photo.id}`}
                                                key={photo.id}
                                                className="group block border border-black rounded-lg overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white"
                                            >
                                                <div className="aspect-square bg-gray-100 overflow-hidden border-b border-black">
                                                    <img
                                                        src={imgUrl}
                                                        alt={photo.description || "Photo"}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-xs font-bold text-gray-500 uppercase">
                                                            {new Date(photo.uploaded_at).toLocaleDateString()}
                                                        </p>
                                                        {photo.is_liked && <span className="text-xs">❤️</span>}
                                                    </div>
                                                    <p className="text-sm font-medium truncate text-black">
                                                        {photo.title || photo.description || ""}
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                                        by {photo.photographer_email || "Unknown"}
                                                    </p>

                                                    {photo.tagged_users_details && photo.tagged_users_details.length > 0 && (
                                                        <div className="mt-3 flex -space-x-2">
                                                            {photo.tagged_users_details.slice(0, 3).map(u => (
                                                                <div
                                                                    key={u.id}
                                                                    className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center border-2 border-white"
                                                                    title={u.full_name || u.email}
                                                                >
                                                                    {(u.full_name || u.email || "?")[0].toUpperCase()}
                                                                </div>
                                                            ))}
                                                            {photo.tagged_users_details.length > 3 && (
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 text-black text-[10px] flex items-center justify-center border-2 border-white font-bold">
                                                                    +{photo.tagged_users_details.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            hasSearched && (
                                <div className="text-center py-20 bg-gray-50 border border-dashed border-black/20 rounded-lg">
                                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-500">No photos found</h3>
                                    <p className="text-gray-400 mt-1">Try adjusting your filters</p>
                                </div>
                            )
                        )}

                        {!hasSearched && (
                            <div className="text-center py-20">
                                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-black/10">
                                    <Search className="w-12 h-12 text-gray-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-700">Start your search</h2>
                                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                    Use the filters above to find photos by event name, photographer, 
                                    tagged users, or date range.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchPage;
