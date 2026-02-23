const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  query: { type: String, required: true },
  location: { type: String, required: true },
  targetKeywords: [{ type: String }],
  
  status: {
    type: String,
    enum: ['idle', 'running', 'paused', 'completed', 'failed'],
    default: 'idle'
  },
  
  progress: {
    total: { type: Number, default: 0 },
    scraped: { type: Number, default: 0 },
    enriched: { type: Number, default: 0 },
    scored: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  
  stats: {
    highLeads: { type: Number, default: 0 },
    mediumLeads: { type: Number, default: 0 },
    lowLeads: { type: Number, default: 0 },
    withWebsite: { type: Number, default: 0 },
    withEmail: { type: Number, default: 0 }
  },
  
  settings: {
    maxResults: { type: Number, default: 20 },
    enableAIEnrichment: { type: Boolean, default: true },
    enableLeadScoring: { type: Boolean, default: true }
  },
  
  errorLog: [{ type: String }],
  
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

campaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
