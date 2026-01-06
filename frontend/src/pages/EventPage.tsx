import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Upload, ArrowLeft, MapPin, Calendar, Loader2, FolderOpen, Image as ImageIcon, Plus } from 'lucide-react';
import PhotoCard from '../components/PhotoCard';
import AlbumCard from '../components/AlbumCard';
import CreateAlbumDialog from '../components/CreateAlbumDialog';
import { Event, Album, Photo } from '../types';

const EventPage: React.FC = () => {
    const { id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]); 
    const [loading, setLoading] = useState(true);
    const [createAlbumOpen, setCreateAlbumOpen] = useState(false);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
                const allPhotos: Photo[] = photosRes.data.results || photosRes.data;

                const loosePhotos = allPhotos.filter((photo: Photo) => photo.album === null); 
                // these are photos in event without an album
                setPhotos(loosePhotos);
                
                // DEBUG :- Start polling only if there are unprocessed photos
                //  fetches data from backend every 2 secs
                const hasUnprocessed = loosePhotos.some((photo: Photo) => photo.is_processed === false);
                if (hasUnprocessed && !pollIntervalRef.current) {
                    pollIntervalRef.current = setInterval(async () => {
                        try {
                            const photosRes = await api.get(`/api/gallery/photos/?event=${id}`);
                            const allPhotos: Photo[] = photosRes.data.results || photosRes.data;
                            const loosePhotos = allPhotos.filter((photo: Photo) => photo.album === null);
                            setPhotos(loosePhotos);
                            // Stop polling if all photos are processed
                            const stillUnprocessed = loosePhotos.some((photo: Photo) => photo.is_processed === false);
                            if (!stillUnprocessed && pollIntervalRef.current) {
                                clearInterval(pollIntervalRef.current);
                                pollIntervalRef.current = null;
                                // Force one more refresh to ensure UI is up to date
                                const finalPhotosRes = await api.get(`/api/gallery/photos/?event=${id}`);
                                const finalAllPhotos: Photo[] = finalPhotosRes.data.results || finalPhotosRes.data;
                                const finalLoosePhotos = finalAllPhotos.filter((photo: Photo) => photo.album === null);
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

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                <Link to="/home" className="inline-flex items-center gap-2 text-black hover:underline mb-6 transition">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                </Link>

                {loading ? (
                    <div className="text-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-black mx-auto" />
                        <p className="mt-4 text-gray-600">Loading event...</p>
                    </div>
                ) : !event ? (
                    <div className="text-center py-20">
                        <p className="text-black">Event not found.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg p-8 border border-black mb-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h1 className="text-4xl font-bold text-black mb-3">{event.name}</h1>
                                    <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                                    </div>
                                    <p className="mt-4 text-gray-700 max-w-2xl">{event.description}</p>
                                </div>
                                
                                <div className="flex gap-3">
                                    <Link 
                                        to={`/upload/${id}`} 
                                        className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 border border-black"
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
                                    <FolderOpen className="w-6 h-6 text-black" />
                                    <h2 className="text-2xl font-bold text-black">Albums</h2>
                                </div>
                                <button 
                                    onClick={() => setCreateAlbumOpen(true)}
                                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black px-4 py-2 rounded-lg border border-black transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="font-medium text-sm">Create Album</span>
                                </button>

                                <CreateAlbumDialog
                                    open={createAlbumOpen}
                                    onClose={() => setCreateAlbumOpen(false)}
                                    eventId={id || ''}
                                    onSuccess={() => {
                                        // Refresh albums list
                                        api.get(`/api/gallery/albums/?event=${id}`).then(res => {
                                            setAlbums(res.data.results || res.data);
                                        });
                                    }}
                                />
                            </div>

                            {albums.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {albums.map(album => (
                                        <AlbumCard key={album.id} album={album} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-black">
                                    <p className="text-gray-600 text-sm">No albums yet. Organize your photos by creating one.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <ImageIcon className="w-6 h-6 text-black" />
                                <h2 className="text-2xl font-bold text-black">
                                    {albums.length > 0 ? "Other Photos" : "Photos"}
                                </h2>
                            </div>

                            {photos.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-black">
                                    <p className="text-gray-600">No loose photos found.</p>
                                    {albums.length === 0 && (
                                        <p className="text-gray-500 text-sm mt-1">This event is empty.</p>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default EventPage;