import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Image as ImageIcon } from 'lucide-react';

const AlbumCard = ({ album }) => {
    return (
        <Link to={`/album/${album.id}`} className="group block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                <div className="h-40 bg-blue-50 relative flex items-center justify-center overflow-hidden">
                    {album.cover_image ? (
                        <img 
                            src={album.cover_image} 
                            alt={album.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                    ) : (
                        <Folder className="w-16 h-16 text-blue-200 group-hover:text-blue-400 transition" />
                    )}
                    
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {album.photos?.length || 0}
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600">
                        {album.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {album.description || "No description"}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default AlbumCard;