import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Aperture, Clock, Gauge, User, Tag, UserPlus } from 'lucide-react';
import InteractionBar from '../components/InteractionBar';
import TaggingModal from '../components/TaggingModal';
import api from '../api/axios';

const PhotoDetail = () => {
    const { id } = useParams();
    const [photo, setPhoto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTagModalOpen, setTagModalOpen] = useState(false);
    
    useEffect(() => {
        const fetchSinglePhoto = async () => {
            try {
                const res = await api.get(`/api/gallery/photos/${id}/`);
                setPhoto(res.data);
            } catch (err) {
                console.error("Failed to load photo", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSinglePhoto();
    }, [id]);

    if (isLoading) return (
        <div className="min-h-screen bg-white flex items-center justify-center text-black">
            Loading photo details...
        </div>
    );
    
    if (!photo) return (
        <div className="min-h-screen bg-white flex items-center justify-center text-black">
            Photo not found.
        </div>
    );

    let imageUrl = photo.image;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
    } else if (imageUrl && imageUrl.startsWith('http://127.0.0.1:8000')) {
        imageUrl = imageUrl.replace('http://127.0.0.1:8000', '');
    }

    // Fallback for date display!
    const dateString = new Date(photo.uploaded_at || photo.created_at || Date.now()).toLocaleDateString();

    return (
        <div className="min-h-screen bg-white py-10 px-4">
            <div className="max-w-4xl mx-auto"> 
                
                <Link to="/home" className="inline-flex items-center gap-2 text-black hover:underline mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Feed
                </Link>

                <div className="bg-white rounded-lg border border-black overflow-hidden">                    
                    <div className="p-4 border-b border-black flex items-center gap-3 bg-white">
                        <div className="bg-black p-2 rounded-full">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-black">
                                {photo.photographer_email || "Unknown Photographer"}
                            </p>
                            <p className="text-xs text-gray-600">{dateString}</p>
                        </div>
                    </div>

                    <div className="bg-black flex justify-center py-4">
                        <img 
                            src={imageUrl} 
                            alt={photo.description || "Photo detail"} 
                            className="max-h-[85vh] w-auto object-contain"
                        />
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-medium text-black mb-3">
                                {photo.description || <span className="text-gray-400 italic"></span>}
                            </h2>
                            <>
                            {photo.manual_tags && photo.manual_tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {photo.manual_tags.map((tag, idx) => (
                                        <span key={"manual-"+idx} className="flex items-center gap-1 px-3 py-1 bg-white text-black text-sm rounded-full border border-black font-medium">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {photo.auto_tags && photo.auto_tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {photo.auto_tags.map((tag, idx) => (
                                        <span key={"auto-"+idx} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-black text-sm rounded-full border border-black font-medium">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            </>

                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500 mr-2">People:</h3>
                                
                                {photo.tagged_users_details && photo.tagged_users_details.map((user) => (
                                    <span key={user.id} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                                        <User className="w-3 h-3" />
                                        @{user.username}
                                    </span>
                                ))}

                                <button 
                                    onClick={() => setTagModalOpen(true)}
                                    className="flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                                >
                                    <UserPlus className="w-3 h-3" />
                                    Tag
                                </button>
                            </div>
                        </div>

                        {photo.exif_data && Object.keys(photo.exif_data).length > 0 && (
                            <div className="mb-8 bg-white rounded-lg p-6 border border-black">
                                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-5 flex items-center gap-2">
                                    <Camera className="w-4 h-4" /> Technical Details
                                </h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {photo.exif_data.Model && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-600 uppercase font-bold mb-1">Camera</span>
                                            <span className="text-sm font-medium text-black">{photo.exif_data.Model}</span>
                                        </div>
                                    )}
                                    {photo.exif_data.FNumber && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-600 uppercase font-bold mb-1">Aperture</span>
                                            <span className="text-sm font-medium text-black flex items-center gap-1">
                                                <Aperture className="w-3.5 h-3.5 text-black" /> 
                                                f/{photo.exif_data.FNumber}
                                            </span>
                                        </div>
                                    )}
                                    {photo.exif_data.ISOSpeedRatings && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-600 uppercase font-bold mb-1">ISO</span>
                                            <span className="text-sm font-medium text-black flex items-center gap-1">
                                                <Gauge className="w-3.5 h-3.5 text-black" /> 
                                                {photo.exif_data.ISOSpeedRatings}
                                            </span>
                                        </div>
                                    )}
                                    {photo.exif_data.ExposureTime && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-600 uppercase font-bold mb-1">Shutter</span>
                                            <span className="text-sm font-medium text-black flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-black" /> 
                                                {photo.exif_data.ExposureTime}s
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-black">
                            <InteractionBar 
                                photoId={photo.id} 
                                initialLikesCount={photo.likes_count} 
                                initialLiked={photo.is_liked} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {photo && (
                <TaggingModal 
                    photo={photo} 
                    isOpen={isTagModalOpen} 
                    onClose={() => setTagModalOpen(false)}
                    onUpdate={(updatedPhoto) => setPhoto(updatedPhoto)}
                />
            )}
        </div>
    );
};

export default PhotoDetail;