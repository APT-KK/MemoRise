import React, { useState } from 'react';
import { Heart, MessageCircle, Send, CornerDownRight, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, photoId, onReplyPosted }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            await api.post(`/interactions/photos/${photoId}/comments/`, {
                content: replyText,
                parent: comment.id 
            });
            
            toast.success("Reply posted!");
            setIsReplying(false);
            setReplyText("");
            onReplyPosted(); // Trigger a refresh of the list
        } catch (err) {
            toast.error("Failed to post reply");
        }
    };

    return (
        <div className="mb-3">
            <div className="bg-gray-100 p-3 rounded-lg text-sm group relative">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="font-bold mr-2 text-gray-900">{comment.user}</span>
                        <span className="text-gray-700">{comment.content}</span>
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-xs text-gray-500 hover:text-blue-600 mt-1 font-medium flex items-center gap-1"
                >
                    <MessageSquare className="w-3 h-3" /> Reply
                </button>
            </div>

            {isReplying && (
                <form onSubmit={handleSendReply} className="ml-6 mt-2 flex gap-2">
                    <CornerDownRight className="w-4 h-4 text-gray-400 mt-2" />
                    <div className="flex-1 flex gap-2">
                        <input 
                            autoFocus
                            type="text" 
                            className="flex-1 p-2 border text-xs rounded-md focus:outline-none focus:border-blue-500"
                            placeholder={`Reply to ${comment.user}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button type="submit" className="text-blue-600 hover:text-blue-800">
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            )}
            
            {/* Render Nested Replies*/}
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 mt-2 border-l-2 border-gray-300 pl-3">
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


const InteractionBar = ({ photoId, initialLikesCount }) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const fetchComments = async () => {
        try {
            const res = await api.get(`/interactions/photos/${photoId}/comments/`);
            setComments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLike = async () => {
        try {
            const response = await api.post(`/interactions/photos/${photoId}/like/`);
            setLiked(response.data.liked);
            setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
        } catch (error) {
            toast.error("Could not like photo");
        }
    };

    const toggleComments = async () => {
        setShowComments(!showComments);
        if (!showComments && comments.length === 0) {
            fetchComments(); 
        }
    };
    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await api.post(`/interactions/photos/${photoId}/comments/`, {
                content: newComment,
                parent: null 
            });
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
                    className={`flex items-center gap-1 transition ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                >
                    <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
                    <span>{likesCount}</span>
                </button>

                <button 
                    onClick={toggleComments}
                    className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition"
                >
                    <MessageCircle className="h-6 w-6" />
                    <span>{comments.length > 0 ? comments.length : 'Comments'}</span>
                </button>
            </div>

            {/* Comments List */}
            {showComments && (
                <div className="bg-gray-50 p-3 rounded-lg mt-2">
                    <form onSubmit={handlePostComment} className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            className="flex-1 p-2 border rounded-md text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" className="text-blue-600 hover:text-blue-800">
                            <Send className="h-5 w-5" />
                        </button>
                    </form>

                    <div className="max-h-60 overflow-y-auto pr-2">
                        {comments.map(comment => (
                            <CommentItem
                                key={comment.id} 
                                comment={comment}
                                photoId={photoId}
                                onReplyPosted={fetchComments}
                             />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractionBar;



