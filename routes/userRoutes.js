const express = require('express');
const {
  register,
  login,
  getMe,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// public
router.post('/register', register);
router.post('/login', login);

// protected  (/me must come before /:id)
router.get('/me', protect, getMe);
router.get('/', protect, getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;
