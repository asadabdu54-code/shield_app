const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const user = await User.create({ email, password, name: name || '' });
    const token = signToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/me  (protected — update name / password)
router.patch('/me', auth, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required to set a new one' });
      }
      const match = await user.comparePassword(currentPassword);
      if (!match) return res.status(401).json({ error: 'Current password is incorrect' });
      user.password = newPassword;
    }

    await user.save();
    res.json({ user });
  } catch (err) {
    console.error('Update me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
