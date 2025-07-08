const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = adminAuth; 