import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const { notifications, unreadCount, markAllAsRead } = useWebSocket();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const dropdownRef = useRef(null);

    // navigate to the resource from the notif
    const handleNotificationClick = (notif: any) => {
        if (notif.resource_id) {
            setIsOpen(false);
            navigate(`/photos/${notif.resource_id}`);
        }
    };

    // this will close the dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (!isOpen) {
            markAllAsRead();
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className="relative p-2 text-white hover:text-gray-200 transition-colors focus:outline-none"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-white text-black rounded-full border border-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg overflow-hidden z-50 border border-black origin-top-right transform transition-all">
                    <div className="p-3 border-b border-black flex justify-between items-center bg-white">
                        <h3 className="font-semibold text-black">Notifications</h3>
                        <span className="text-xs text-gray-600">{notifications.length} Recent</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-600 text-sm">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((notif, index) => (
                                <div 
                                    key={index} 
                                    className={`p-3 border-b border-black hover:bg-gray-50 transition-colors flex gap-3 items-start ${notif.resource_id ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    {notif.target?.image ? (
                                        <img 
                                            src={notif.target.image.startsWith('http') ? notif.target.image : `http://127.0.0.1:8000${notif.target.image}`} 
                                            alt="preview" 
                                            className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-gray-200"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-md bg-black flex items-center justify-center text-white flex-shrink-0">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <p className="text-sm text-black leading-snug">
                                            <span className="font-semibold text-black">{notif.actor_name || notif.actor?.full_name}</span>
                                            {' '}{notif.message || notif.verb}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {notif.created_at 
                                                ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) 
                                                : "Just now"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;