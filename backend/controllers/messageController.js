const Message = require('../models/Message');
const User = require('../models/User');

const isChatAllowed = (senderRole, receiverRole) => {
  return senderRole === 'admin' || receiverRole === 'admin';
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;
    const senderRole = req.user.role;

    const receiver = await User.findById(receiverId);
    if (!receiver)
      return res.status(404).json({ message: 'Receiver not found' });

    const allowed = isChatAllowed(senderRole, receiver.role);
    if (!allowed)
      return res.status(403).json({
        message: 'Chat is only available with the hospital admin'
      });

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: userId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatContacts = async (req, res) => {
  try {
    const myId = req.user._id;
    const myRole = req.user.role;

    if (myRole === 'admin') {
      const messages = await Message.find({
        $or: [{ senderId: myId }, { receiverId: myId }]
      }).sort({ createdAt: -1 });

      const contactIds = [...new Set(
        messages.map(m =>
          m.senderId.toString() === myId.toString()
            ? m.receiverId.toString()
            : m.senderId.toString()
        )
      )];

      const contacts = await User.find({
        _id: { $in: contactIds }
      }).select('name email photo role');

      const contactsWithUnread = await Promise.all(
        contacts.map(async (contact) => {
          const unread = await Message.countDocuments({
            senderId: contact._id,
            receiverId: myId,
            seen: false
          });
          return { ...contact.toObject(), unread };
        })
      );

      return res.json(contactsWithUnread);
    }

    const admin = await User.findOne({ role: 'admin' })
      .select('name email photo role');

    if (!admin) return res.json([]);

    const unread = await Message.countDocuments({
      senderId: admin._id,
      receiverId: myId,
      seen: false
    });

    res.json([{ ...admin.toObject(), unread }]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages, getChatContacts };