const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// Get leads for a campaign
router.get('/', async (req, res) => {
  try {
    const { campaignId, score, status, page = 1, limit = 50, search } = req.query;

    const filter = {};
    if (campaignId) filter.campaignId = campaignId;
    if (score) filter.score = score;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { aiSummary: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort({ scoreValue: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export leads as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { campaignId, score } = req.query;
    const filter = {};
    if (campaignId) filter.campaignId = campaignId;
    if (score) filter.score = score;

    const leads = await Lead.find(filter).sort({ scoreValue: -1 });

    const headers = ['Business Name', 'Category', 'Address', 'Phone', 'Website', 'Email', 'Email Guesses', 'Rating', 'Reviews', 'Score', 'Score Value', 'AI Summary', 'Key Services'];
    const rows = leads.map(l => [
      l.businessName,
      l.category,
      l.address,
      l.phone,
      l.website,
      l.email,
      (l.emailGuesses || []).join('; '),
      l.rating,
      l.reviewCount,
      l.score,
      l.scoreValue,
      `"${(l.aiSummary || '').replace(/"/g, "'")}"`,
      (l.keyServices || []).join('; ')
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
