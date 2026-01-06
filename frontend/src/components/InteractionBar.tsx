import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { IconButton, Typography, Button, TextField, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReplyIcon from '@mui/icons-material/Reply';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SendIcon from '@mui/icons-material/Send';

interface CommentReply {
    id: number;
    user: string;
    content: string;
    likes_count?: number;
    is_liked?: boolean;
    replies?: CommentReply[];
}

interface CommentData {
    id: number;
    user: string;
    content: string;
    likes_count?: number;
    is_liked?: boolean;
    replies?: CommentReply[];
}

interface CommentItemProps {
    comment: CommentData;
    photoId: number;
    onReplyPosted: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, photoId, onReplyPosted }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);
    const [liked, setLiked] = useState(comment.is_liked || false);
    const [likesCount, setLikesCount] = useState(comment.likes_count || 0);

    const handleLikeComment = async () => {
        try {
            const res = await api.post(`/api/interactions/comments/${comment.id}/like/`);
            setLiked(res.data.liked);
            setLikesCount(res.data.total_likes);
        } catch (err) {
            console.error("Failed to like comment", err);
            toast.error("Could not like comment");
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            await api.post(`/api/interactions/photos/${photoId}/comments/`, {
                content: replyText,
                parent: comment.id 
            });
            
            toast.success("Reply posted!");
            setIsReplying(false);
            setReplyText("");
            setShowReplies(true);
            onReplyPosted(); 
        } catch (err) {
            toast.error("Failed to post reply");
        }
    };

    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div className="mb-3">
            <Box sx={{ 
                bgcolor: 'white', 
                border: 1, 
                borderColor: 'grey.300', 
                p: 2, 
                borderRadius: 2 
            }}>
                <Box sx={{ mb: 1 }}>
                    <Typography component="span" fontWeight="bold" sx={{ mr: 1 }}>
                        {comment.user}
                    </Typography>
                    <Typography component="span" color="text.primary">
                        {comment.content}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                            onClick={handleLikeComment} 
                            size="small"
                            sx={{ p: 0.5 }}
                        >
                            {liked ? (
                                <FavoriteIcon sx={{ fontSize: 18, color: 'black' }} />
                            ) : (
                                <FavoriteBorderIcon sx={{ fontSize: 18, color: 'grey.500' }} />
                            )}
                        </IconButton>
                        {likesCount > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {likesCount}
                            </Typography>
                        )}
                    </Box>

                    <Button
                        onClick={() => setIsReplying(!isReplying)}
                        size="small"
                        startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
                        sx={{ 
                            color: isReplying ? 'black' : 'grey.600',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            minWidth: 'auto',
                            px: 1,
                            '&:hover': { color: 'black', bgcolor: 'grey.100' }
                        }}
                    >
                        Reply
                    </Button>

                    {hasReplies && (
                        <Button
                            onClick={() => setShowReplies(!showReplies)}
                            size="small"
                            endIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            sx={{ 
                                color: 'black',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                minWidth: 'auto',
                                px: 1,
                                '&:hover': { bgcolor: 'grey.100' }
                            }}
                        >
                            {showReplies ? 'Hide' : `${comment.replies!.length} Replies`}
                        </Button>
                    )}
                </Box>
            </Box>

            {isReplying && (
                <Box 
                    component="form" 
                    onSubmit={handleSendReply} 
                    sx={{ 
                        ml: 3, 
                        mt: 1, 
                        display: 'flex', 
                        gap: 1,
                        alignItems: 'center'
                    }}
                >
                    <ReplyIcon sx={{ color: 'grey.400', fontSize: 20, transform: 'scaleX(-1)' }} />
                    <TextField
                        autoFocus
                        size="small"
                        fullWidth
                        placeholder={`Reply to ${comment.user}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontSize: '0.875rem',
                            }
                        }}
                    />
                    <IconButton 
                        type="submit" 
                        sx={{ 
                            bgcolor: 'black', 
                            color: 'white',
                            '&:hover': { bgcolor: 'grey.800' },
                            p: 1
                        }}
                    >
                        <SendIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
            )}
            
            {showReplies && hasReplies && (
                <Box sx={{ ml: 3, mt: 1, borderLeft: 2, borderColor: 'grey.300', pl: 2 }}>
                    {comment.replies!.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            photoId={photoId}
                            onReplyPosted={onReplyPosted} 
                        />
                    ))}
                </Box>
            )}
        </div>
    );
};

interface InteractionBarProps {
    photoId: number;
    initialLikesCount?: number;
    initialLiked?: boolean;
}

const InteractionBar: React.FC<InteractionBarProps> = ({ photoId, initialLikesCount, initialLiked }) => {
    const [liked, setLiked] = useState(initialLiked || false);
    const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        setLikesCount(initialLikesCount || 0);
        setLiked(initialLiked || false);
    }, [initialLikesCount, initialLiked]);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/api/interactions/photos/${photoId}/comments/`);
            const commentsData = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setComments(commentsData);
        } catch (err) {
            console.error(err);
            toast.error("Could not load comments");
        }
    };

    const handleLike = async () => {
        try {
            const response = await api.post(`/api/interactions/photos/${photoId}/like/`);
            setLiked(response.data.liked);
            if (typeof response.data.total_likes === 'number') {
                setLikesCount(response.data.total_likes);
            }
        } catch (error) {
            toast.error("Could not like photo");
        }
    };

    const toggleComments = async () => {
        const nextState = !showComments;
        setShowComments(nextState);
        if (nextState) {
            fetchComments(); 
        }
    };
    
    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const commentData = { content: newComment };
            const res = await api.post(`/api/interactions/photos/${photoId}/comments/`, commentData);
            setComments([res.data, ...comments]);
            setNewComment("");
            toast.success("Comment posted!");
            fetchComments();
        } catch (err) {
            toast.error("Failed to post comment");
        }
    };

    return (
        <div className="mt-3">
            <div className="flex items-center gap-4 mb-2">
                <button 
                    onClick={handleLike} 
                    className={`flex items-center gap-1 transition ${liked ? 'text-black' : 'text-gray-600 hover:text-black'} bg-white border border-black rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black`}
                >
                    <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
                    <span>{likesCount}</span>
                </button>

                <button 
                    onClick={toggleComments}
                    className="flex items-center gap-1 text-gray-600 hover:text-black transition bg-white border border-black rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                >
                    <MessageCircle className="h-6 w-6" />
                    <span className="font-medium text-black">
                        {showComments 
                            ? 'Hide Comments' 
                            : (comments.length > 0 ? `${comments.length} Comments` : 'Comments')}
                    </span>
                    {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {showComments && (
                <div className="bg-white p-3 rounded-lg mt-2 border border-black">
                    <form onSubmit={handlePostComment} className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            className="flex-1 p-2 rounded-md text-sm bg-white text-black border border-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-500"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" className="text-white bg-black hover:bg-gray-800 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black border border-black">
                            <Send className="h-5 w-5" />
                        </button>
                    </form>

                    <div className="max-h-60 overflow-y-auto pr-2">
                        {Array.isArray(comments) && comments.length > 0 ? (
                            comments.map(comment => (
                                <CommentItem
                                    key={comment.id} 
                                    comment={comment}
                                    photoId={photoId}
                                    onReplyPosted={fetchComments}
                                 />
                            ))
                        ) : (
                            <p className="text-gray-600 text-sm text-center py-4">No comments yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractionBar;