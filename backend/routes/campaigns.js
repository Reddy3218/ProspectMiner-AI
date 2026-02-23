const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const miningService = require('../services/miningService');

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Campaign.countDocuments();
    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ campaigns, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single campaign with lead stats
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const leadCount = await Lead.countDocuments({ campaignId: campaign._id });
    res.json({ campaign, leadCount, isRunning: miningService.isRunning(req.params.id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete campaign and its leads
router.delete('/:id', async (req, res) => {
  try {
    await Lead.deleteMany({ campaignId: req.params.id });
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pause campaign
router.post('/:id/pause', async (req, res) => {
  try {
    await miningService.pauseCampaign(req.params.id);
    const campaign = await Campaign.findById(req.params.id);
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restart campaign
router.post('/:id/restart', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    await Lead.deleteMany({ campaignId: campaign._id });

    campaign.status = 'idle';
    campaign.progress = { total: 0, scraped: 0, enriched: 0, scored: 0, failed: 0 };
    campaign.stats = { highLeads: 0, mediumLeads: 0, lowLeads: 0, withWebsite: 0, withEmail: 0 };
    campaign.errorLog = [];
    campaign.startedAt = null;
    campaign.completedAt = null;
    await campaign.save();

    miningService.startMining(campaign._id).catch(console.error);

    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
