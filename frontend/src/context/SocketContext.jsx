import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('userOnline', user._id);

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      // Show toast notification for new messages
      newSocket.on('newMessageNotification', ({ senderName, message }) => {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
            bg-white shadow-lg rounded-xl p-4 flex items-start gap-3
            border border-gray-100 max-w-sm`}>
            <div className="bg-primary-100 rounded-full p-2">
              <span className="text-primary-600 text-lg">💬</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                New message from {senderName}
              </p>
              <p className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">
                {message}
              </p>
            </div>
          </div>
        ), { duration: 4000, position: 'top-right' });

        setNotifications(prev => [...prev, { senderName, message }]);
      });

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);