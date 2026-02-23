const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    index: true
  },
  businessName: { type: String, required: true },
  category: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  email: { type: String, default: '' },
  emailGuesses: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  // AI Enrichment
  aiSummary: { type: String, default: '' },
  aiInsights: { type: Map, of: String, default: {} },
  aiCategories: [{ type: String }],
  keyServices: [{ type: String }],
  
  // Lead Scoring
  score: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Unscored'],
    default: 'Unscored'
  },
  scoreValue: { type: Number, default: 0 }, // 0-100
  scoreBreakdown: {
    websiteQuality: { type: Number, default: 0 },
    keywordMatch: { type: Number, default: 0 },
    reviewScore: { type: Number, default: 0 },
    contactCompleteness: { type: Number, default: 0 }
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'scraping', 'enriching', 'scored', 'failed'],
    default: 'pending'
  },
  enriched: { type: Boolean, default: false },
  enrichmentError: { type: String, default: '' },
  
  // Source data
  sourceUrl: { type: String, default: '' },
  rawData: { type: Object, default: {} },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

leadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

leadSchema.index({ campaignId: 1, score: 1 });
leadSchema.index({ businessName: 'text', aiSummary: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
