import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PhotoCard from '../components/PhotoCard';
import { Camera, LogOut, User } from 'lucide-react'; 
import toast from 'react-hot-toast';

const Home = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
 
                const res = await api.get('/api/gallery/photos/');
                setPhotos(res.data.results || res.data);

                try {
                    const userRes = await api.get('/api/auth/users/me/');
                    setCurrentUser(userRes.data);
                } catch (userErr) {
                    console.warn("User not logged in or fetch failed", userErr);
                }

            } catch (err) {
                console.error("Failed to load photos", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    toast.error("Please log in to view photos");
                    navigate('/login');
                } else {
                    toast.error("Failed to load photos");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authTokens');
        toast.success('Logged out successfully');
        navigate('/');
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
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Camera className="h-6 w-6 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">MEMORISE</span>
                        </div>

                        <div className="flex items-center gap-4">

                            {currentUser && (
                                <Link 
                                    to="/my-profile"
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="hidden sm:inline">My Profile</span>
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {photos.length === 0 ? (
                    <div className="text-center py-20">
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No photos yet</h2>
                        <p className="text-gray-500">Start uploading photos to see them here!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {photos.map((photo) => (
                            <PhotoCard key={photo.id} photo={photo} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;