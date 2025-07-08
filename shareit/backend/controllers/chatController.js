const Chat = require('../models/Chat');
const User = require('../models/User');

// Get or create chat with a user
exports.getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [currentUser, userId] }
    }).populate('participants', 'name email');

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [currentUser, userId]
      });
      await chat.save();
      chat = await Chat.findById(chat._id).populate('participants', 'name email');
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting or creating chat' });
  }
};

// Get all chats for current user
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name email')
    .sort({ lastMessageTime: -1 });

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting chats' });
  }
};

// Get single chat
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email')
      .populate('messages.sender', 'name email');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting chat' });
  }
};

// Send message in chat
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    const message = {
      sender: req.user._id,
      content
    };

    chat.messages.push(message);
    chat.lastMessage = content;
    chat.lastMessageTime = new Date();
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name email')
      .populate('messages.sender', 'name email');

    res.json(updatedChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message' });
  }
}; 