import { Link } from 'react-router-dom';
import InteractionBar from './InteractionBar';
import { User } from 'lucide-react';

const PhotoCard = ({ photo }) => {
    let imageUrl = photo.image;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        // if it's missing leading slash, add it
        imageUrl = '/' + imageUrl;
    } else if (imageUrl && imageUrl.startsWith('http://127.0.0.1:8000')) {
        // Convert absolute backend URL to relative for proxy of vite
        imageUrl = imageUrl.replace('http://127.0.0.1:8000', '');
    }

    const photographerEmail = photo.photographer_email || "Unknown User";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">

            <div className="p-3 border-b border-gray-100">
                <Link 
                    to={`/profile/${encodeURIComponent(photographerEmail)}`}
                    className="flex items-center gap-2 group cursor-pointer"
                >
                    <div className="bg-gray-100 group-hover:bg-blue-100 transition-colors p-1.5 rounded-full">
                        <User className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <span className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">
                        {photographerEmail}
                    </span>
                </Link>
            </div>

            <Link to={`/photos/${photo.id}`}>
                <img 
                    src={imageUrl} 
                    alt={photo.description} 
                    className="w-full h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        e.target.style.display = 'none';
                    }}
                />
            </Link>

            <div className="p-4">
                <p className="text-gray-800 text-sm mb-3 line-clamp-2">
                    {photo.description || "No description provided."}
                </p>

                <div className="pt-2 border-t border-gray-100">
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