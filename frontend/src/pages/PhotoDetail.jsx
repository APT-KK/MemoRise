import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Camera, Aperture, Clock, Gauge, User } from 'lucide-react';
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

    if (isLoading) return <div className="p-10 text-center text-gray-500">Loading photo details...</div>;       
    if (!photo) return <div className="p-10 text-center text-red-500">Photo not found.</div>;

    let imageUrl = photo.image;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Feed
                </Link>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{photo.photographer_email || "Unknown Photographer"}</p>
                            <p className="text-xs text-gray-500">{new Date(photo.uploaded_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Main Image */}
                    <div className="bg-black flex justify-center">
                        <img 
                            src={imageUrl} 
                            alt={photo.description} 
                            className="max-h-[80vh] w-auto object-contain"
                        />
                    </div>

                    <div className="p-6">
                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-2">
                                {photo.description || "No description provided."}
                            </h2>
                            {/* Auto Tags */}
                            {photo.auto_tags && photo.auto_tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {photo.auto_tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- EXIF DATA SECTION --- */}
                        {photo.exif_data && Object.keys(photo.exif_data).length > 0 && (
                            <div className="mb-8 bg-slate-50 rounded-lg p-4 border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Camera className="w-4 h-4" /> Camera Details
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2">
                                    {photo.exif_data.Model && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase">Camera</span>
                                            <span className="text-sm font-semibold text-gray-700">{photo.exif_data.Model}</span>
                                        </div>
                                    )}
                                    {photo.exif_data.FNumber && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase">Aperture</span>
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                                <Aperture className="w-3 h-3 text-gray-400" /> f/{photo.exif_data.FNumber}
                                            </span>
                                        </div>
                                    )}
                                    {photo.exif_data.ISOSpeedRatings && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase">ISO</span>
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                                <Gauge className="w-3 h-3 text-gray-400" /> {photo.exif_data.ISOSpeedRatings}
                                            </span>
                                        </div>
                                    )}
                                    {photo.exif_data.ExposureTime && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase">Shutter</span>
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-gray-400" /> {photo.exif_data.ExposureTime}s
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Interaction Bar*/}
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