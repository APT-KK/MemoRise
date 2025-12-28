import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, CornerDownRight, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, photoId, onReplyPosted }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);

    const handleSendReply = async (e) => {
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
            <div className="bg-white border border-black p-3 rounded-lg text-sm group relative">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="font-bold mr-2 text-black">{comment.user}</span>
                        <span className="text-black">{comment.content}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                    <button 
                        onClick={() => setIsReplying(!isReplying)}
                        className="text-xs text-gray-600 hover:text-black font-medium flex items-center gap-1"
                    >
                        <MessageSquare className="w-3 h-3" /> Reply
                    </button>

                    {hasReplies && (
                        <button 
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-xs text-black hover:underline font-medium flex items-center gap-1"
                        >
                            {showReplies ? (
                                <>Hide Replies <ChevronUp className="w-3 h-3" /></>
                            ) : (
                                <>View {comment.replies.length} Replies <ChevronDown className="w-3 h-3" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {isReplying && (
                <form onSubmit={handleSendReply} className="ml-6 mt-2 flex gap-2">
                    <CornerDownRight className="w-4 h-4 text-gray-600 mt-2" />
                    <div className="flex-1 flex gap-2">
                        <input 
                            autoFocus
                            type="text" 
                            className="flex-1 p-2 border border-black text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                            placeholder={`Reply to ${comment.user}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button type="submit" className="text-black hover:text-gray-800">
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            )}
            
            {showReplies && hasReplies && (
                <div className="ml-6 mt-2 border-l-2 border-black pl-3">
                    {comment.replies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            photoId={photoId}
                            onReplyPosted={onReplyPosted} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const InteractionBar = ({ photoId, initialLikesCount, initialLiked }) => {
    const [liked, setLiked] = useState(initialLiked || false);
    const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
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
    
    const handlePostComment = async (e) => {
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
            {/* Actions Bar */}
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

            {/* Comments List */}
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