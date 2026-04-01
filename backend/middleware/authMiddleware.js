const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      const user = await User.findById(decoded.id)
        .select('_id username name role active schoolClass subjects children parents')
        .populate('schoolClass', 'name')
        .populate('subjects', 'name')
        .populate('children', '_id name username role schoolClass')
        .populate('parents', '_id name username role');

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }

      if (!user.active) {
        return res.status(401).json({ message: 'User is disabled' });
      }

      req.user = {
        id: user._id,
        role: user.role,
        username: user.username,
      };
      req.currentUser = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'User role is not authorized' });
    }
    next();
  };
};

module.exports = { protect, authorize };
