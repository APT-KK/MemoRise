import React from 'react';
import { Link } from 'react-router-dom';
import InteractionBar from './InteractionBar';
import { User } from 'lucide-react';

const PhotoCard = ({ photo }) => {
    const imageUrl = photo.image.startsWith('http') 
        ? photo.image 
        : `http://127.0.0.1:8000${photo.image}`;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">

            <div className="p-3 flex items-center gap-2 border-b border-gray-100">
                <div className="bg-gray-200 p-1.5 rounded-full">
                    <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="font-semibold text-sm text-gray-800">
                    {photo.photographer_email || "Unknown User"}
                </span>
            </div>

            <Link to={`/photos/${photo.id}`}>
                <img 
                    src={imageUrl} 
                    alt={photo.description} 
                    className="w-full h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
            </Link>

            <div className="p-4">
                <p className="text-gray-800 text-sm mb-3 line-clamp-2">
                    {photo.description || "No description provided."}
                </p>

                <div className="pt-2 border-t border-gray-100">
                    <InteractionBar 
                        photoId={photo.id} 
                        initialLikesCount={photo.likes_cnt || 0} 
                    />
                </div>
            </div>
        </div>
    );
};

export default PhotoCard;