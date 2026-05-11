import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am MediCare AI Assistant. How can I help you today? You can ask me about our services, how to book appointments, or general health questions.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    const updatedMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const history = updatedMessages.slice(1, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data } = await axios.post(
        'http://localhost:5000/api/ai/chatbot',
        {
          message: userMessage,
          history
        }
      );

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I am having trouble responding right now. Please contact us at +94 11 234 5678 or info@medicare.lk'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'How do I book an appointment?',
    'What are your working hours?',
    'What specialists are available?',
    'Where is the hospital located?'
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-primary-700 transition flex items-center justify-center z-50">
        {isOpen
          ? <FaTimes size={20} />
          : <FaRobot size={22} />
        }
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden"
          style={{ height: '500px' }}>

          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex items-center gap-3">
            <div className="bg-white bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <p className="font-bold text-white">MediCare AI Assistant</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <p className="text-primary-100 text-xs">Online 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-white opacity-70 hover:opacity-100 transition">
              <FaTimes size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <FaRobot className="text-primary-600" size={12} />
                  </div>
                )}
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <FaRobot className="text-primary-600" size={12} />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1.5 rounded-lg hover:bg-primary-100 transition border border-primary-100">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={sendMessage}
            className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 transition disabled:opacity-50">
              {loading
                ? <FaSpinner className="animate-spin" size={14} />
                : <FaPaperPlane size={14} />
              }
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;