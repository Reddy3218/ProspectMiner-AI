const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const miningService = require('../services/miningService');

// Create a new search campaign
router.post('/', async (req, res) => {
  try {
    const { query, location, name, targetKeywords, settings } = req.body;

    if (!query || !location) {
      return res.status(400).json({ error: 'Query and location are required' });
    }

    const campaign = new Campaign({
      name: name || `${query} in ${location}`,
      query,
      location,
      targetKeywords: targetKeywords || [],
      settings: {
        maxResults: settings?.maxResults || 20,
        enableAIEnrichment: settings?.enableAIEnrichment !== false,
        enableLeadScoring: settings?.enableLeadScoring !== false,
      }
    });

    await campaign.save();

    // Start mining in background
    miningService.startMining(campaign._id).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Campaign started successfully',
      campaign
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get campaign status
router.get('/:id/status', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    res.json({
      campaign,
      isRunning: miningService.isRunning(req.params.id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
