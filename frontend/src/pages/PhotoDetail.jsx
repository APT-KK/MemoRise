import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Camera, Aperture, Clock, Gauge, User, Tag } from 'lucide-react';
import InteractionBar from '../components/InteractionBar';

const PhotoDetail = () => {
    const { id } = useParams();
    const [photo, setPhoto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
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
        <div className="min-h-screen flex items-center justify-center text-gray-500">
            Loading photo details...
        </div>
    );
    
    if (!photo) return (
        <div className="min-h-screen flex items-center justify-center text-red-500">
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
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-4xl mx-auto"> 
                
                <Link to="/home" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Feed
                </Link>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">                    
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">
                                {photo.photographer_email || "Unknown Photographer"}
                            </p>
                            <p className="text-xs text-gray-500">{dateString}</p>
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
                            <h2 className="text-xl font-medium text-gray-900 mb-3">
                                {photo.description || <span className="text-gray-400 italic"></span>}
                            </h2>
                            <>
                            {photo.manual_tags && photo.manual_tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {photo.manual_tags.map((tag, idx) => (
                                        <span key={"manual-"+idx} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full border border-blue-100 font-medium">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {photo.auto_tags && photo.auto_tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {photo.auto_tags.map((tag, idx) => (
                                        <span key={"auto-"+idx} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200 font-medium">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            </>
                        </div>

                        {photo.exif_data && Object.keys(photo.exif_data).length > 0 && (
                            <div className="mb-8 bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                                    <Camera className="w-4 h-4" /> Technical Details
                                </h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {photo.exif_data.Model && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Camera</span>
                                            <span className="text-sm font-medium text-gray-700">{photo.exif_data.Model}</span>
                                        </div>
                                    )}
                                    {photo.exif_data.FNumber && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Aperture</span>
                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Aperture className="w-3.5 h-3.5 text-gray-400" /> 
                                                f/{photo.exif_data.FNumber}
                                            </span>
                                        </div>
                                    )}
                                    {photo.exif_data.ISOSpeedRatings && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">ISO</span>
                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Gauge className="w-3.5 h-3.5 text-gray-400" /> 
                                                {photo.exif_data.ISOSpeedRatings}
                                            </span>
                                        </div>
                                    )}
                                    {photo.exif_data.ExposureTime && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Shutter</span>
                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" /> 
                                                {photo.exif_data.ExposureTime}s
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-100">
                            <InteractionBar 
                                photoId={photo.id} 
                                initialLikesCount={photo.likes_count} 
                                initialLiked={photo.is_liked} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoDetail;