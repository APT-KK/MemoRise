import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import api from '../api/axios'; 
import toast from 'react-hot-toast';
import PhotoCard from '../components/PhotoCard'; 
import { ArrowLeft, User, Grid, Heart, Image as ImageIcon } from 'lucide-react';

const UserProfile = () => {
    const { email } = useParams();
    const [profile, setProfile] = useState({
        full_name: '',
        bio: '',
        email: '',
        profile_picture_url: '',
        role: '',
    });
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

                if (userPhotos.length > 0 && userPhotos[0].photographer) {
                    const profileRes = await api.get(`/api/auth/users/${userPhotos[0].photographer}/`);
                    setProfile(profileRes.data);
                }
            } catch (err) { 
                toast.error("Failed to load user photos");
            } finally {
                setLoading(false);
            }
        };  
        if(email) fetchUserPhotos();
    }, [email]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-white border-b border-black sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <Link to="/home" className="flex items-center gap-2 text-black hover:underline transition">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Feed</span>
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg border border-black p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden bg-black">
                            {profile.profile_picture_url ? (
                                <img 
                                    src={profile.profile_picture_url} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl font-bold text-black mb-1">
                                {profile.full_name || decodeURIComponent(email)}
                            </h1>
                            <p className="text-gray-600 text-sm mb-2">{decodeURIComponent(email)}</p>
                            <p className="text-black">{profile.bio || "No bio yet."}</p>
                        </div>
                        <div className="flex gap-6 border-t md:border-t-0 md:border-l border-black pt-6 md:pt-0 md:pl-6">
                            <div className="text-center">
                                <div className="flex items-center gap-1.5 justify-center md:justify-start text-black font-bold text-xl">
                                    <ImageIcon className="w-5 h-5 text-black" />
                                    {stats.totalPhotos}
                                </div>
                                <span className="text-xs text-gray-600 uppercase tracking-wide">Photos</span>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-1.5 justify-center md:justify-start text-black font-bold text-xl">
                                    <Heart className="w-5 h-5 text-black fill-current" />
                                    {stats.totalLikes}
                                </div>
                                <span className="text-xs text-gray-600 uppercase tracking-wide">Total Likes</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <Grid className="w-5 h-5 text-black" />
                        <h2 className="text-lg font-semibold text-black">Gallery</h2>
                    </div>
                    {photos.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-black">
                            <p className="text-gray-600">This user hasn't uploaded any photos yet.</p>
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