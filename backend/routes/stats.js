const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');

router.get('/', async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'running' });
    const totalLeads = await Lead.countDocuments();
    const highLeads = await Lead.countDocuments({ score: 'High' });
    const mediumLeads = await Lead.countDocuments({ score: 'Medium' });
    const lowLeads = await Lead.countDocuments({ score: 'Low' });
    const enrichedLeads = await Lead.countDocuments({ enriched: true });
    const withWebsite = await Lead.countDocuments({ website: { $ne: '' } });

    const recentCampaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name query location status progress stats createdAt');

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalLeads,
      highLeads,
      mediumLeads,
      lowLeads,
      enrichedLeads,
      withWebsite,
      recentCampaigns
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
