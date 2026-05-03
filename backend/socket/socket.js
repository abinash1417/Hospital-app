const { Server } = require('socket.io');

let io;
const onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Connected:', socket.id);

    socket.on('userOnline', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log(`✅ ${userId} online`);
    });

    socket.on('sendMessage', ({ senderId, receiverId, message, senderName }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', {
          senderId,
          receiverId,
          message,
          senderName,
          createdAt: new Date()
        });
        // Send notification to receiver
        io.to(receiverSocketId).emit('newMessageNotification', {
          senderId,
          senderName,
          message
        });
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId });
      }
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', { senderId });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      });
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

const getIo = () => io;
module.exports = { initSocket, getIo };