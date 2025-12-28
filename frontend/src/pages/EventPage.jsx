import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Upload, ArrowLeft, MapPin, Calendar, Loader2, FolderOpen, Image as ImageIcon, Plus } from 'lucide-react';
import PhotoCard from '../components/PhotoCard';
import AlbumCard from '../components/AlbumCard';

const EventPage = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [photos, setPhotos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const pollIntervalRef = useRef(null);

    useEffect(() => {
        // fetching event data, albums, and loose photos
        const fetchEventData = async () => {
            try {
                setLoading(true);
                
                const eventRes = await api.get(`/api/gallery/events/${id}/`);
                setEvent(eventRes.data);

                const albumsRes = await api.get(`/api/gallery/albums/?event=${id}`);
                setAlbums(albumsRes.data.results || albumsRes.data);

                const photosRes = await api.get(`/api/gallery/photos/?event=${id}`);
                const allPhotos = photosRes.data.results || photosRes.data;

                const loosePhotos = allPhotos.filter(photo => photo.album === null); 
                // these are photos in event without an album
                setPhotos(loosePhotos);
                
                // DEBUG :- Start polling only if there are unprocessed photos
                //  fetches data from backend every 2 secs
                const hasUnprocessed = loosePhotos.some(photo => photo.is_processed === false);
                if (hasUnprocessed && !pollIntervalRef.current) {
                    pollIntervalRef.current = setInterval(async () => {
                        try {
                            const photosRes = await api.get(`/api/gallery/photos/?event=${id}`);
                            const allPhotos = photosRes.data.results || photosRes.data;
                            const loosePhotos = allPhotos.filter(photo => photo.album === null);
                            setPhotos(loosePhotos);
                            // Stop polling if all photos are processed
                            const stillUnprocessed = loosePhotos.some(photo => photo.is_processed === false);
                            if (!stillUnprocessed && pollIntervalRef.current) {
                                clearInterval(pollIntervalRef.current);
                                pollIntervalRef.current = null;
                                // Force one more refresh to ensure UI is up to date
                                const finalPhotosRes = await api.get(`/api/gallery/photos/?event=${id}`);
                                const finalAllPhotos = finalPhotosRes.data.results || finalPhotosRes.data;
                                const finalLoosePhotos = finalAllPhotos.filter(photo => photo.album === null);
                                setPhotos(finalLoosePhotos);
                            }
                        } catch (error) {
                            console.error("Error polling for photo updates", error);
                        }
                    }, 2000);
                }

            } catch (error) {
                console.error("Error fetching event data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );

    if (!event) return <div className="text-center py-20">Event not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Link to="/home" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                </Link>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">{event.name}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                            </div>
                            <p className="mt-4 text-gray-600 max-w-2xl">{event.description}</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <Link 
                                to={`/upload/${id}`} 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 transition flex items-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                Upload Photos
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <FolderOpen className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Albums</h2>
                        </div>
                        <Link 
                            to={`/create-album?event=${id}`}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-medium text-sm">Create Album</span>
                        </Link>
                    </div>

                    {albums.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {albums.map(album => (
                                <AlbumCard key={album.id} album={album} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-100 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 text-sm">No albums yet. Organize your photos by creating one.</p>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            {albums.length > 0 ? "Other Photos" : "Photos"}
                        </h2>
                    </div>

                    {photos.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No loose photos found.</p>
                            {albums.length === 0 && (
                                <p className="text-gray-400 text-sm mt-1">This event is empty.</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {photos.map(photo => (
                                <PhotoCard key={photo.id} photo={photo} /> 
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventPage;