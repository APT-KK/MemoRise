import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Upload, ArrowLeft, MapPin, Calendar, Loader2 } from 'lucide-react';
import PhotoCard from '../components/PhotoCard';

const EventPage = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //fetching event details and photos it entails
        const fetchEventData = async () => {
            try {
                const eventRes = await api.get(`/api/gallery/events/${id}/`);
                setEvent(eventRes.data);

                const photosRes = await api.get(`/api/gallery/photos/?event=${id}`);
                setPhotos(photosRes.data.results || photosRes.data);
            } catch (error) {
                console.error("Error fetching event data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEventData();
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

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">{event.name}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {photos.length} Photos
                                </span>
                            </div>
                            <p className="mt-4 text-gray-600 max-w-2xl">{event.description}</p>
                        </div>
                        
                        <Link 
                            to={`/upload/${id}`} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 transition flex items-center gap-2 shrink-0"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Photos
                        </Link>
                    </div>
                </div>

                {photos.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">No photos yet</p>
                        <p className="text-gray-400 text-sm mt-1">Click "Upload Photos" to add some memories!</p>
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
    );
};

export default EventPage;