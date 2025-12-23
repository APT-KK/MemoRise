import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import api from '../api/axios'; 
import toast from 'react-hot-toast';
import PhotoCard from '../components/PhotoCard'; 
import { ArrowLeft, User, Grid, Heart, Image as ImageIcon } from 'lucide-react';

const UserProfile = () => {
    const { email } = useParams();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLikes: 0,
        totalPhotos: 0
    });

    useEffect(() => {
        const fetchUserPhotos = async () => {
            try {

                const res = await api.get(`/api/gallery/photos/`);
                const allPhotos = res.data.results || res.data;

                const decodedEmail = decodeURIComponent(email);

                const userPhotos = allPhotos.filter(photo => photo.photographer_email === decodedEmail);
                setPhotos(userPhotos);

                const totalLikes = userPhotos.reduce((sum, photo) => sum + (photo.likes_count || 0), 0);
                setStats({
                    totalLikes,
                    totalPhotos: userPhotos.length
                });
            } catch (err) { 
                console.error("Failed to load user photos", err);
                toast.error("Failed to load user photos");
            } finally {
                setLoading(false);
            }
        };  

        if(email) fetchUserPhotos();
    }, [email]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

   return (
        <div className="min-h-screen bg-gray-100">

            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Feed</span>
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">

                        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-full border-4 border-white shadow-md">
                            <User className="w-12 h-12 text-blue-600" />
                        </div>
                        
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                {decodeURIComponent(email)}
                            </h1>
                            <p className="text-gray-500 text-sm">Photographer</p>
                        </div>

                        <div className="flex gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                            <div className="text-center">
                                <div className="flex items-center gap-1.5 justify-center md:justify-start text-gray-900 font-bold text-xl">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                    {stats.totalPhotos}
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Photos</span>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-1.5 justify-center md:justify-start text-gray-900 font-bold text-xl">
                                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                                    {stats.totalLikes}
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Total Likes</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <Grid className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800">Gallery</h2>
                    </div>

                    {photos.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">This user hasn't uploaded any photos yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {photos.map((photo) => (
                                <PhotoCard key={photo.id} photo={photo} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserProfile;