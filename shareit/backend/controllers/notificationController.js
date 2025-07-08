const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { recipient, sender, post, type, message } = req.body;
    
    const notification = new Notification({
      recipient,
      sender,
      post,
      type,
      message
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating notification' });
  }
};

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user._id, 
      type: { $in: ['interest', 'message'] } 
    })
      .populate('sender', 'name email department year')
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// Get only announcement notifications for a user
exports.getUserAnnouncements = async (req, res) => {
  try {
    const announcements = await Notification.find({
      recipient: req.user._id,
      type: 'announcement'
    }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting announcements' });
  }
}; 