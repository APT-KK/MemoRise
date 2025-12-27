import { createContext, useEffect, useState, useContext, useRef } from 'react';
import toast from 'react-hot-toast';

// like a global container for websocket connection and notifications
const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const socketRef = useRef(null);


    useEffect(() => {
        const authData = localStorage.getItem('authTokens');
        if(!authData) return;

        const token = JSON.parse(authData).access;

        if(socketRef.current) return; // if already connected

        const wsUrl = `ws://127.0.0.1:8000/ws/notifications/?token=${access}`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("🟢 Connected to Real-time Notifications");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleNewNotification(data);
        };

        ws.onclose = () => {
            socketRef.current = null;
        };

        return () => {
            if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
           }
        };
    }, []);

    const handleNewNotification = (data) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);

        const actorName = data.actor?.full_name || "Someone";
        const verb = data.verb || "performed an action";
        const text = `${actorName} ${verb}`;

        let imageUrl = null;
        // to resolve relative paths from django
        if (data.target?.image) {
            imageUrl = data.target.image.startsWith('http') 
                ? data.target.image 
                : `http://127.0.0.1:8000${data.target.image}`;
        }
        toast((t) => (
            <div className="flex items-start gap-3 w-full max-w-md cursor-pointer" onClick={() => toast.dismiss(t.id)}>
                {imageUrl && (
                    <img 
                        src={imageUrl} 
                        alt="notification" 
                        className="w-10 h-10 rounded-md object-cover border border-gray-200" 
                    />
                )}
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{text}</p>
                    <p className="text-xs text-gray-500 mt-1">Just now</p>
                </div>
            </div>
        ), {
            position: 'top-right',
            duration: 5000,
            style: {
                background: '#fff',
                color: '#333',
                padding: '12px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }
        });
    };

    const markAllAsRead = () => {
        setUnreadCount(0);
    };

    return (
        <WebSocketContext.Provider value={{ socket, notifications, unreadCount, markAllAsRead }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);






        