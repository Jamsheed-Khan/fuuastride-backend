const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const admin = require('../config/firebase');

// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: '❌ Email or phone already registered' });
    }

    // Create user (password is hashed automatically via model hook)
    const user = await User.create({ name, email, phone, password, role });

    res.status(201).json({
      message: '✅ Registered successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: '❌ Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: '❌ Your account has been deactivated' });
    }

    res.json({
      message: '✅ Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPhone = async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phone = decoded.phone_number;

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, role: 'passenger' });
    }

    res.json({
      message: '✅ Phone verified',
      token: generateToken(user._id),
      user
    });
  } catch (error) {
    res.status(401).json({ message: '❌ Invalid token' });
  }
};

module.exports = { register, login, verifyPhone };