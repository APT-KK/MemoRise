import { Link } from 'react-router-dom';
import { Folder, Image as ImageIcon } from 'lucide-react';
import { Album } from '../types';

interface AlbumCardProps {
    album: Album;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
    return (
        <Link to={`/album/${album.id}`} className="group block">
            <div className="bg-white rounded-lg border border-black overflow-hidden hover:shadow-lg transition-all">
                <div className="h-40 bg-black relative flex items-center justify-center overflow-hidden">
                    {album.cover_image ? (
                        <img 
                            src={album.cover_image} 
                            alt={album.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                    ) : (
                        <Folder className="w-16 h-16 text-white/50 group-hover:text-white transition" />
                    )}
                    
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1 border border-white/20">
                        <ImageIcon className="w-3 h-3" />
                        {album.photos?.length || 0}
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-bold text-black truncate group-hover:underline">
                        {album.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {album.description || "No description"}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default AlbumCard;