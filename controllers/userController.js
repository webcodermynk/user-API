const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/users/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ user: userResponse(user), token: signToken(user._id) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/users/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ user: userResponse(user), token: signToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users  (protected)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ count: users.length, users: users.map(userResponse) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id  (protected)
exports.getUser = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(userResponse(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id  (protected - own profile or admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const isSelf = req.user._id.toString() === id;
    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password; // re-hashed by pre-save hook
    // only admins can change roles
    if (req.body.role && req.user.role === 'admin') user.role = req.body.role;

    await user.save();
    res.json(userResponse(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/users/:id  (protected - own account or admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const isSelf = req.user._id.toString() === id;
    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own account' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/me  (protected)
exports.getMe = (req, res) => {
  res.json(userResponse(req.user));
};
