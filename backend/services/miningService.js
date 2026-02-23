const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const scraperService = require('./scraperService');
const aiEnrichmentService = require('./aiEnrichmentService');

class MiningService {
  constructor() {
    this.activeCampaigns = new Map();
  }

  async startMining(campaignId) {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    if (this.activeCampaigns.has(campaignId.toString())) {
      throw new Error('Campaign is already running');
    }

    // Mark as running
    campaign.status = 'running';
    campaign.startedAt = new Date();
    await campaign.save();

    this.activeCampaigns.set(campaignId.toString(), true);

    // Run mining in background
    this.runMining(campaign).catch(async (err) => {
      console.error(`Campaign ${campaignId} failed:`, err);
      campaign.status = 'failed';
      campaign.errorLog.push(err.message);
      await campaign.save();
      this.activeCampaigns.delete(campaignId.toString());
    });

    return campaign;
  }

  async runMining(campaign) {
    const campaignId = campaign._id.toString();

    try {
      // Step 1: Scrape leads
      console.log(`\n🚀 Starting campaign: ${campaign.name}`);
      const rawLeads = await scraperService.scrapeGoogleMaps(
        campaign.query,
        campaign.location,
        campaign.settings.maxResults
      );

      console.log(`✅ Scraped ${rawLeads.length} businesses`);

      // Step 2: Save raw leads to DB
      const savedLeads = [];
      for (const raw of rawLeads) {
        try {
          // Email guessing
          const emailGuesses = aiEnrichmentService.guessEmailFormats(
            raw.businessName,
            raw.website
          );

          const lead = new Lead({
            campaignId: campaign._id,
            ...raw,
            emailGuesses,
            status: 'scraping',
          });
          await lead.save();
          savedLeads.push(lead);

          campaign.progress.scraped++;
          campaign.progress.total = rawLeads.length;
          await Campaign.findByIdAndUpdate(campaign._id, {
            'progress.scraped': campaign.progress.scraped,
            'progress.total': campaign.progress.total
          });
        } catch (e) {
          console.error('Error saving lead:', e.message);
        }
      }

      // Step 3: AI Enrichment
      if (campaign.settings.enableAIEnrichment) {
        for (const lead of savedLeads) {
          if (!this.activeCampaigns.get(campaignId)) break; // Check if paused

          try {
            lead.status = 'enriching';
            await lead.save();

            // Scrape website content
            let websiteContent = '';
            if (lead.website) {
              console.log(`🌐 Scraping website: ${lead.website}`);
              websiteContent = await scraperService.scrapeWebsiteContent(lead.website);
            }

            // AI enrichment
            const enrichment = await aiEnrichmentService.enrichLead(
              lead,
              websiteContent,
              campaign.query
            );

            Object.assign(lead, enrichment);
            lead.enriched = true;
            lead.status = 'enriching';
            await lead.save();

            campaign.progress.enriched++;
            await Campaign.findByIdAndUpdate(campaign._id, {
              'progress.enriched': campaign.progress.enriched
            });

            // Small delay to be respectful
            await new Promise(r => setTimeout(r, 1000));
          } catch (e) {
            console.error(`Enrichment error for ${lead.businessName}:`, e.message);
            lead.enrichmentError = e.message;
            campaign.progress.failed++;
          }
        }
      }

      // Step 4: Lead Scoring
      if (campaign.settings.enableLeadScoring) {
        let highCount = 0, mediumCount = 0, lowCount = 0;

        for (const lead of savedLeads) {
          if (!this.activeCampaigns.get(campaignId)) break;

          try {
            const scoring = await aiEnrichmentService.scoreLead(lead, campaign.query);
            lead.score = scoring.score;
            lead.scoreValue = scoring.scoreValue;
            lead.scoreBreakdown = scoring.scoreBreakdown;
            lead.status = 'scored';
            await lead.save();

            if (scoring.score === 'High') highCount++;
            else if (scoring.score === 'Medium') mediumCount++;
            else lowCount++;

            campaign.progress.scored++;
            await Campaign.findByIdAndUpdate(campaign._id, {
              'progress.scored': campaign.progress.scored
            });

            await new Promise(r => setTimeout(r, 500));
          } catch (e) {
            console.error(`Scoring error for ${lead.businessName}:`, e.message);
            lead.score = 'Low';
            lead.status = 'scored';
            await lead.save();
          }
        }

        // Update campaign stats
        const withWebsite = savedLeads.filter(l => l.website).length;
        const withEmail = savedLeads.filter(l => l.email || (l.emailGuesses && l.emailGuesses.length > 0)).length;

        await Campaign.findByIdAndUpdate(campaign._id, {
          'stats.highLeads': highCount,
          'stats.mediumLeads': mediumCount,
          'stats.lowLeads': lowCount,
          'stats.withWebsite': withWebsite,
          'stats.withEmail': withEmail,
          status: 'completed',
          completedAt: new Date()
        });
      } else {
        await Campaign.findByIdAndUpdate(campaign._id, {
          status: 'completed',
          completedAt: new Date()
        });
      }

      console.log(`\n✅ Campaign "${campaign.name}" completed!`);
      this.activeCampaigns.delete(campaignId);

    } catch (error) {
      this.activeCampaigns.delete(campaignId);
      throw error;
    }
  }

  async pauseCampaign(campaignId) {
    this.activeCampaigns.delete(campaignId.toString());
    await Campaign.findByIdAndUpdate(campaignId, { status: 'paused' });
  }

  isRunning(campaignId) {
    return this.activeCampaigns.has(campaignId.toString());
  }
}

module.exports = new MiningService();
