const router = require('express').Router();
const auth = require('../middleware/auth');
const Rule = require('../models/Rule');

// All routes require auth
router.use(auth);

// GET /api/rules
router.get('/', async (req, res) => {
  try {
    const { type, enabled, page = 1, limit = 50 } = req.query;
    const filter = { owner: req.user._id };
    if (type) filter.type = type;
    if (enabled !== undefined) filter.enabled = enabled === 'true';

    const rules = await Rule.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Rule.countDocuments(filter);
    res.json({ rules, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rules
router.post('/', async (req, res) => {
  try {
    const { type, value, description, enabled } = req.body;
    if (!type || !value) {
      return res.status(400).json({ error: 'type and value are required' });
    }
    const rule = await Rule.create({
      owner: req.user._id,
      type,
      value,
      description,
      enabled: enabled !== undefined ? enabled : true,
    });
    res.status(201).json({ rule });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/rules/:id
router.patch('/:id', async (req, res) => {
  try {
    const rule = await Rule.findOne({ _id: req.params.id, owner: req.user._id });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    const { type, value, description, enabled } = req.body;
    if (type !== undefined) rule.type = type;
    if (value !== undefined) rule.value = value;
    if (description !== undefined) rule.description = description;
    if (enabled !== undefined) rule.enabled = enabled;

    await rule.save();
    res.json({ rule });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/rules/:id
router.delete('/:id', async (req, res) => {
  try {
    const rule = await Rule.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json({ message: 'Rule deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/rules  (bulk delete by ids[])
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array required' });
    }
    await Rule.deleteMany({ _id: { $in: ids }, owner: req.user._id });
    res.json({ message: 'Rules deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
