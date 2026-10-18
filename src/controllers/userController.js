const User = require('../models/User');

// @route  GET /api/user/profile
// @access Private
const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

// @route  PUT /api/user/profile
// @access Private
const updateProfile = async (req, res) => {
  const { name, phone, avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ message: '✅ Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile };