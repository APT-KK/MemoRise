import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PhotoCard from '../components/PhotoCard'; 
import { ArrowLeft } from 'lucide-react';

const PhotoDetail = () => {
    const { id } = useParams();
    const [photo, setPhoto] = useState(null);
    
    useEffect(() => {
        const fetchSinglePhoto = async () => {
            try {
                const res = await api.get(`/api/gallery/photos/${id}/`);
                setPhoto(res.data);
            } catch (err) {
                console.error("Failed to load photo", err);
            }
        };
        fetchSinglePhoto();
    }, [id]);

    if (!photo) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Feed
                </Link>
                <PhotoCard photo={photo} />
            </div>
        </div>
    );
};

export default PhotoDetail;