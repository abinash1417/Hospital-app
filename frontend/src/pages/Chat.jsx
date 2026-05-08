import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaComments } from 'react-icons/fa';

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const selectedUserRef = useRef(null);

  const setSelected = (contact) => {
    setSelectedUser(contact);
    selectedUserRef.current = contact;
  };

  useEffect(() => { fetchContacts(); }, []);

  useEffect(() => {
    if (userId && contacts.length > 0) {
      const contact = contacts.find(c => c._id === userId);
      if (contact) selectContact(contact);
    }
  }, [userId, contacts]);

  useEffect(() => {
    if (!socket) return;

    socket.off('receiveMessage');
    socket.off('typing');
    socket.off('stopTyping');

    socket.on('receiveMessage', (msg) => {
      const currentSelected = selectedUserRef.current;
      if (
        currentSelected &&
        (msg.senderId === currentSelected._id ||
          msg.senderId?._id === currentSelected._id)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('typing', ({ senderId }) => {
      if (selectedUserRef.current?._id === senderId) setTyping(true);
    });

    socket.on('stopTyping', ({ senderId }) => {
      if (selectedUserRef.current?._id === senderId) setTyping(false);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const { data } = await API.get('/messages/contacts');
      setContacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectContact = async (contact) => {
    setSelected(contact);
    setLoading(true);
    try {
      const { data } = await API.get(`/messages/${contact._id}`);
      setMessages(data);
    } catch (err) {
      toast.error('Cannot open chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    try {
      const { data } = await API.post('/messages', {
        receiverId: selectedUser._id,
        message: text
      });

      setMessages(prev => [...prev, data]);

      socket?.emit('sendMessage', {
        senderId: user._id,
        receiverId: selectedUser._id,
        message: text,
        senderName: user.name
      });

      socket?.emit('stopTyping', {
        senderId: user._id,
        receiverId: selectedUser._id
      });

      setText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket?.emit('typing', {
      senderId: user._id,
      receiverId: selectedUser?._id
    });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('stopTyping', {
        senderId: user._id,
        receiverId: selectedUser?._id
      });
    }, 1500);
  };

  const isOnline = (id) => onlineUsers.includes(id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        style={{ height: 'calc(100vh - 120px)' }}>
        <div className="flex h-full">

          <div className="w-72 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FaComments className="text-primary-600" />
                Messages
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {user?.role === 'admin'
                  ? 'Chat with doctors and patients'
                  : 'Chat with hospital admin'}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <FaComments className="text-gray-300 text-4xl mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No conversations yet</p>
                  {user?.role !== 'admin' && (
                    <p className="text-gray-400 text-xs mt-2">
                      Send a message to start chatting with admin
                    </p>
                  )}
                </div>
              ) : (
                contacts.map(contact => (
                  <button
                    key={contact._id}
                    onClick={() => selectContact(contact)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition text-left border-b border-gray-50 ${
                      selectedUser?._id === contact._id ? 'bg-primary-50' : ''
                    }`}>
                    <div className="relative">
                      <img
                        src={contact.photo || `https://ui-avatars.com/api/?name=${contact.name}&background=0ea5e9&color=fff`}
                        alt={contact.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      {isOnline(contact._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {contact.role} • {isOnline(contact._id) ? '🟢 Online' : '⚫ Offline'}
                      </p>
                    </div>
                    {contact.unread > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {contact.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedUser.photo || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=0ea5e9&color=fff`}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {isOnline(selectedUser._id) && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {selectedUser.role} • {typing
                        ? '✍️ typing...'
                        : isOnline(selectedUser._id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loading ? <Spinner /> : (
                    <>
                      {messages.length === 0 && (
                        <div className="text-center py-10">
                          <p className="text-gray-400 text-sm">
                            No messages yet. Say hello! 👋
                          </p>
                        </div>
                      )}
                      {messages.map((msg, i) => {
                        const isMe =
                          msg.senderId === user._id ||
                          msg.senderId?._id === user._id;
                        return (
                          <div key={i}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                              isMe
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}>
                              <p>{msg.message}</p>
                              <p className={`text-xs mt-1 ${
                                isMe ? 'text-primary-200' : 'text-gray-400'
                              }`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit', minute: '2-digit'
                                })}
                                {isMe && (
                                  <span className="ml-1">
                                    {msg.seen ? ' ✓✓' : ' ✓'}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSend}
                  className="p-4 border-t border-gray-100 flex gap-3">
                  <input
                    type="text"
                    value={text}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 transition disabled:opacity-50">
                    <FaPaperPlane size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <FaComments className="text-gray-300 text-6xl mb-4" />
                <p className="text-gray-400 text-lg font-medium">
                  Select a conversation
                </p>
                <p className="text-gray-400 text-sm mt-2 text-center px-8">
                  {user?.role === 'admin'
                    ? 'Select a user from the sidebar to start chatting'
                    : 'Click on Admin to start a conversation'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;