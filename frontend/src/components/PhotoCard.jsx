import { Link } from 'react-router-dom';
import InteractionBar from './InteractionBar';
import { User, Loader2 } from 'lucide-react';

const PhotoCard = ({ photo }) => {
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
        <div className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:shadow-2xl hover:border-slate-600 transition-all duration-300">
            <div className="p-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <Link 
                    to={`/profile/${encodeURIComponent(photographerEmail)}`}
                    className="flex items-center gap-3 cursor-pointer group/user"
                >
                    <div className="bg-slate-800 group-hover/user:bg-blue-500/20 transition-colors p-1.5 rounded-full border border-slate-700">
                        <User className="w-4 h-4 text-slate-400 group-hover/user:text-blue-500 transition-colors" />
                    </div>
                    <span className="font-medium text-sm text-slate-300 group-hover/user:text-blue-400 transition-colors truncate">
                        {photographerEmail}
                    </span>
                </Link>
            </div>

            <Link to={`/photos/${photo.id}`} className="relative block overflow-hidden aspect-square bg-slate-950">
                {isProcessing && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                        <span className="text-xs font-medium text-blue-400 px-2 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
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
                        e.target.style.display = 'none';
                    }}
                />
            </Link>

            <div className="p-4">
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 h-10">
                    {photo.description ? photo.description : <span className="italic text-slate-600">No description</span>}
                </p>

                <div className="pt-3 border-t border-slate-800">
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