import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Loader2, Calendar, User } from 'lucide-react';
import PhotoCard from '../components/PhotoCard';

const AlbumPage = () => {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await api.get(`/api/gallery/albums/${id}/`);
                setAlbum(res.data);
            } catch (error) {
                console.error("Error fetching album", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbum();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );

    if (!album) return <div className="text-center py-20">Album not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Link 
                    to={album.event ? `/event/${album.event}` : "/home"} 
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {album.event ? "Back to Event" : "Back to Home"}
                </Link>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{album.name}</h1>
                    
                    <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-4">
                        <span className="flex items-center gap-1">
                            <User className="w-4 h-4" /> 
                            By {album.owner || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> 
                            {new Date(album.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    {album.description && (
                        <p className="text-gray-600 border-l-4 border-blue-200 pl-4 italic">
                            {album.description}
                        </p>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        Photos 
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {album.photos ? album.photos.length : 0}
                        </span>
                    </h2>

                    {(!album.photos || album.photos.length === 0) ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">This album is empty.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {album.photos.map(photo => (
                                <PhotoCard key={photo.id} photo={photo} /> 
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlbumPage;