import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; 
import api from '../api/axios'; 
import toast from 'react-hot-toast';
import PhotoCard from '../components/PhotoCard'; 
import { ArrowLeft, User, Grid, Heart, Image as ImageIcon, Pencil, Camera, Trash2 } from 'lucide-react';

const MyProfile = () => {
    const [userId, setUserId] = useState(null);
    const [profile, setProfile] = useState({
        full_name: '',
        bio: '',
        email: '',
        profile_picture: '',
        profile_picture_url: '',
        role: '',
        is_verified: false
    });
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [stats, setStats] = useState({
        totalLikes: 0,
        totalPhotos: 0
    });
    const fileInputRef = useRef(null); // we will use this to trigger file input

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await api.get('/api/auth/users/me/');
                setUserId(res.data.id);
                setProfile(res.data);
            } catch (err) {
                toast.error("Failed to load user");
            } finally {
                setProfileLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!profile.email) return;
        const fetchUserPhotos = async () => {
            try {
                const res = await api.get(`/api/gallery/photos/`);
                const allPhotos = res.data.results || res.data;
                const userPhotos = allPhotos.filter(photo => photo.photographer_email === profile.email);
                setPhotos(userPhotos);
                const totalLikes = userPhotos.reduce((sum, photo) => sum + (photo.likes_count || 0), 0);
                setStats({
                    totalLikes,
                    totalPhotos: userPhotos.length
                });
            } catch (err) {
                toast.error("Failed to load user photos");
            } finally {
                setLoading(false);
            }
        };
        fetchUserPhotos();
    }, [profile.email]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setProfileSaving(true);
        try {
            await api.patch(`/api/auth/users/me/`, {
                full_name: profile.full_name,
                bio: profile.bio,
            });
            toast.success("Profile updated!");
            setEditing(false);
        } catch (err) {
            toast.error("Failed to update profile");
        } finally {
            setProfileSaving(false);
        }
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        //max file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            const res = await api.patch('/api/auth/users/me/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data);
            toast.success('Profile picture updated!');
        } catch (err) {
            toast.error('Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveProfilePicture = async () => {
        if (!window.confirm('Remove profile picture?')) return;

        try {
            await api.delete('/api/auth/users/me/');
            setProfile(prev => ({ ...prev, profile_picture: null, profile_picture_url: null }));
            toast.success('Profile picture removed');
        } catch (err) {
            toast.error('Failed to remove profile picture');
        }
    };

    if (loading || profileLoading) {
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
                        <div className="relative group">
                            <div 
                                className="w-24 h-24 rounded-full border-4 border-black overflow-hidden cursor-pointer bg-black"
                                onClick={handleProfilePictureClick}
                            >
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
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
                                    )}
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            {profile.profile_picture_url && (
                                <button
                                    onClick={handleRemoveProfilePicture}
                                    className="absolute -bottom-2 -right-2 bg-white border border-black rounded-full p-1.5 hover:bg-gray-100 transition"
                                    title="Remove profile picture"
                                >
                                    <Trash2 className="w-3 h-3 text-black" />
                                </button>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            {editing ? (
                                <div>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={profile.full_name}
                                        onChange={handleChange}
                                        className="block w-full border border-black rounded px-3 py-2 mb-2 text-black"
                                        placeholder="Full Name"
                                    />
                                    <textarea
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleChange}
                                        className="block w-full border border-black rounded px-3 py-2 mb-2 text-black"
                                        placeholder="Bio"
                                        rows={3}
                                    />
                                    <button
                                        onClick={handleSave}
                                        disabled={profileSaving}
                                        className="bg-black text-white px-4 py-2 rounded mr-2 hover:bg-gray-800 border border-black"
                                    >
                                        {profileSaving ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="bg-white text-black px-4 py-2 rounded border border-black hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-2xl font-bold text-black mb-1 flex items-center gap-2">
                                        {profile.full_name || profile.email}
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="ml-2 text-gray-600 hover:text-black"
                                            title="Edit Profile"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </h1>
                                    <p className="text-gray-600 text-sm mb-2">{profile.email}</p>
                                    <p className="text-black">{profile.bio || "No bio yet."}</p>
                                </div>
                            )}
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

export default MyProfile;