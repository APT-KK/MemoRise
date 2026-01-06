import { Link } from 'react-router-dom';
import InteractionBar from './InteractionBar';
import { User, Loader2 } from 'lucide-react';
import { Photo } from '../types';

interface PhotoCardProps {
    photo: Photo & { photographer_profile_picture?: string };
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
    let imageUrl = photo.thumbnail || photo.image;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        // if it's missing leading slash, add it
        imageUrl = '/' + imageUrl;
    } else if (imageUrl && imageUrl.startsWith('http://127.0.0.1:8000')) {
        // Convert absolute backend URL to relative for proxy of vite
        imageUrl = imageUrl.replace('http://127.0.0.1:8000', '');
    }

    const photographerEmail = photo.photographer_email || "Unknown User";
    const isProcessing = photo.is_processed === false;

    return (
        <div className="group bg-white rounded-lg border border-black overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-3 border-b border-black bg-white">
                <Link 
                    to={`/profile/${encodeURIComponent(photographerEmail)}`}
                    className="flex items-center gap-3 cursor-pointer group/user"
                >
                    <div className="w-8 h-8 rounded-full border border-black overflow-hidden bg-black">
                        {photo.photographer_profile_picture ? (
                            <img 
                                src={photo.photographer_profile_picture} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                    <span className="font-medium text-sm text-black group-hover/user:underline transition-colors truncate">
                        {photographerEmail}
                    </span>
                </Link>
            </div>

            <Link to={`/photos/${photo.id}`} className="relative block overflow-hidden aspect-square bg-black">
                {isProcessing && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                        <span className="text-xs font-medium text-white px-2 py-1 bg-black/50 rounded-full border border-white/20">
                            Processing...
                        </span>
                    </div>
                )}

                <img 
                    src={imageUrl} 
                    alt={photo.description || "Gallery Photo"} 
                    loading="lazy"
                    className={`
                        w-full h-full object-cover transition-all duration-700
                        ${isProcessing ? 'blur-md scale-105' : 'group-hover:scale-105'}
                    `}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </Link>

            <div className="p-4">
                <p className="text-gray-700 text-sm mb-4 line-clamp-2 h-10">
                    {photo.description ? photo.description : <span className="italic text-gray-400"></span>}
                </p>

                <div className="pt-3 border-t border-black">
                    <InteractionBar 
                        photoId={photo.id} 
                        initialLikesCount={photo.likes_count} 
                        initialLiked={photo.is_liked}
                    />
                </div>
            </div>
        </div>
    );
};

export default PhotoCard;