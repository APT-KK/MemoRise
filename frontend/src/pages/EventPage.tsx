import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Upload, ArrowLeft, MapPin, Calendar, Loader2, FolderOpen, Image as ImageIcon, Plus } from 'lucide-react';
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
    const [selected, setSelected] = useState<number[]>([]);
    const [user, setUser] = useState<any>(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setLoading(true);

                const eventRes = await api.get(`/api/gallery/events/${id}/`);
                setEvent(eventRes.data);

                const albumsRes = await api.get(`/api/gallery/albums/?event=${id}`);
                setAlbums(albumsRes.data.results || albumsRes.data);

                const fetchAllLoosePhotos = async () => {
                    let photosRes = await api.get(`/api/gallery/photos/?event=${id}`);
                    let allPhotos: Photo[] = photosRes.data.results || photosRes.data;
                    let next = photosRes.data.next;
                    while (next) {
                        const url = next.startsWith('http') ? next : `${window.location.origin}${next}`;
                        const nextRes = await api.get(url);
                        allPhotos = allPhotos.concat(nextRes.data.results || []);
                        next = nextRes.data.next;
                    }
                    return allPhotos.filter((photo: Photo) => photo.album === null && String(photo.event) === String(id));
                };

                const loosePhotos = await fetchAllLoosePhotos();
                setPhotos(loosePhotos);

                const hasUnprocessed = loosePhotos.some((photo: Photo) => photo.is_processed !== true);
                if (hasUnprocessed && !pollIntervalRef.current) {
                    pollIntervalRef.current = setInterval(async () => {
                        try {
                            const updatedLoosePhotos = await fetchAllLoosePhotos();

                            setPhotos(prevPhotos => {
                                if (JSON.stringify(updatedLoosePhotos) !== JSON.stringify(prevPhotos)) {
                                    return updatedLoosePhotos;
                                }
                                return prevPhotos;
                            });

                            const stillUnprocessed = updatedLoosePhotos.some((photo: Photo) => photo.is_processed !== true);
                            if (!stillUnprocessed && pollIntervalRef.current) {
                                clearInterval(pollIntervalRef.current);
                                pollIntervalRef.current = null;
                            }
                        } catch (error: any) {
                            if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
                                if (pollIntervalRef.current) {
                                    clearInterval(pollIntervalRef.current);
                                    pollIntervalRef.current = null;
                                }
                            }
                        }
                    }, 3000);
                }

            } catch (error) {
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

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/api/auth/users/me/');
                setUser(res.data);
            } catch (e) {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    const canDelete = user && (
        user.is_superuser ||
        ['Coordinator', 'Admin'].includes(user.role) ||
        ['coordinator', 'admin'].includes(user.role)
    );

    const handleSelect = (id: number) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleConfirmDelete = async () => {
        if (selected.length === 0) return;
        if (window.confirm('Delete selected photos?')) {
            try {
                await api.post('/api/gallery/mass-delete-photos/', { ids: selected });
                setPhotos(prevPhotos => prevPhotos.filter(p => !selected.includes(p.id)));
                setSelected([]);
                setDeleteMode(false);
            } catch (error) {
                console.error("Error deleting photos", error);
            }
        }
    };

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
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">
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
                                {/* {user && (
                                    <span className="text-xs text-red-600">user.role: {user.role || 'N/A'}</span>
                                )} */}
                            </div>

                            {canDelete && photos.length > 0 && !deleteMode && (
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded mb-6 font-medium hover:bg-red-700 transition"
                                    onClick={() => setDeleteMode(true)}
                                >
                                    Delete Photos
                                </button>
                            )}

                            {canDelete && deleteMode && (
                                <div className="mb-6 flex gap-3">
                                    <button
                                        className="bg-gray-200 text-black px-4 py-2 rounded font-medium hover:bg-gray-300 transition"
                                        onClick={() => { setDeleteMode(false); setSelected([]); }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition disabled:opacity-50"
                                        onClick={handleConfirmDelete}
                                        disabled={selected.length === 0}
                                    >
                                        Confirm Delete ({selected.length})
                                    </button>
                                </div>
                            )}

                            {photos.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-black">
                                    <p className="text-gray-600">No loose photos found.</p>
                                    {albums.length === 0 && (
                                        <p className="text-gray-500 text-sm mt-1">This event is empty.</p>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className="columns-2 sm:columns-3 md:columns-4 xl:columns-6 gap-4 space-y-4"
                                    style={{ width: '100%' }}
                                >
                                    {photos.map(photo => {
                                        let imageUrl = photo.thumbnail || photo.image;
                                        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                                            imageUrl = '/' + imageUrl;
                                        }
                                        return (
                                            <div key={photo.id} className="relative mb-4 break-inside-avoid group">
                                                {canDelete && deleteMode && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(photo.id)}
                                                        onChange={() => handleSelect(photo.id)}
                                                        className="absolute top-3 left-3 w-5 h-5 z-20 cursor-pointer accent-red-600"
                                                    />
                                                )}
                                                <Link
                                                    to={`/photos/${photo.id}`}
                                                    style={{ display: 'block' }}
                                                    onClick={(e) => deleteMode && e.preventDefault()}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={photo.title || 'Event photo'}
                                                        className={`w-full rounded-lg border border-black/10 shadow-sm transition hover:shadow-md cursor-pointer ${deleteMode && selected.includes(photo.id) ? 'ring-4 ring-red-600 opacity-80' : ''
                                                            }`}
                                                    />
                                                </Link>
                                            </div>
                                        );
                                    })}
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