const axios = require('axios');

class AIEnrichmentService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = 'claude-opus-4-6';
    this.baseURL = 'https://api.anthropic.com/v1/messages';
  }

  async callClaude(prompt, maxTokens = 1000) {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await axios.post(
      this.baseURL,
      {
        model: this.model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;
  }

  /**
   * Enrich a lead with AI insights from website content
   */
  async enrichLead(lead, websiteContent, userQuery) {
    if (!websiteContent || websiteContent.length < 100) {
      return this.enrichWithoutWebsite(lead, userQuery);
    }

    const prompt = `You are a business intelligence AI. Analyze the following website content for a business and extract key information.

Business Name: ${lead.businessName}
User's Search Query: "${userQuery}"
Website Content (excerpt):
${websiteContent.substring(0, 3000)}

Respond with ONLY valid JSON in this exact format:
{
  "summary": "2-3 sentence summary of what this business does",
  "categories": ["category1", "category2"],
  "keyServices": ["service1", "service2", "service3"],
  "insights": {
    "targetMarket": "description of target customers",
    "specializations": "any notable specializations or niches",
    "queryMatch": "how well does this business match the search query"
  },
  "qualitySignals": {
    "hasDetailedServices": true/false,
    "hasTeamInfo": true/false,
    "hasPricing": true/false,
    "hasCertifications": true/false,
    "professionalTone": true/false
  }
}`;

    try {
      const raw = await this.callClaude(prompt, 800);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      const data = JSON.parse(jsonMatch[0]);
      return {
        aiSummary: data.summary || '',
        aiCategories: data.categories || [],
        keyServices: data.keyServices || [],
        aiInsights: data.insights || {},
        qualitySignals: data.qualitySignals || {}
      };
    } catch (error) {
      console.error('AI enrichment error:', error.message);
      return this.fallbackEnrichment(lead, userQuery);
    }
  }

  async enrichWithoutWebsite(lead, userQuery) {
    const prompt = `You are a business intelligence AI. Based on the business name and category, provide enrichment data.

Business Name: ${lead.businessName}
Category: ${lead.category}
Search Query: "${userQuery}"

Respond with ONLY valid JSON:
{
  "summary": "brief description of what this type of business likely does",
  "categories": ["category1"],
  "keyServices": ["likely service1", "likely service2"],
  "insights": {
    "targetMarket": "likely target customers",
    "specializations": "unknown - no website available",
    "queryMatch": "partial match based on business name"
  },
  "qualitySignals": {
    "hasDetailedServices": false,
    "hasTeamInfo": false,
    "hasPricing": false,
    "hasCertifications": false,
    "professionalTone": false
  }
}`;

    try {
      const raw = await this.callClaude(prompt, 600);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      const data = JSON.parse(jsonMatch[0]);
      return {
        aiSummary: data.summary || '',
        aiCategories: data.categories || [],
        keyServices: data.keyServices || [],
        aiInsights: data.insights || {},
        qualitySignals: data.qualitySignals || {}
      };
    } catch (e) {
      return this.fallbackEnrichment(lead, userQuery);
    }
  }

  fallbackEnrichment(lead, userQuery) {
    return {
      aiSummary: `${lead.businessName} is a ${lead.category || 'local'} business. AI enrichment unavailable.`,
      aiCategories: [lead.category || 'Business'],
      keyServices: [],
      aiInsights: {
        targetMarket: 'Unknown',
        specializations: 'Not analyzed',
        queryMatch: 'Partial'
      },
      qualitySignals: {}
    };
  }

  /**
   * Score a lead using AI
   */
  async scoreLead(lead, userQuery) {
    const prompt = `You are a lead scoring AI for a sales team. Score this business lead.

Search Query: "${userQuery}"
Business: ${lead.businessName}
Category: ${lead.category}
Has Website: ${lead.website ? 'Yes' : 'No'}
Has Phone: ${lead.phone ? 'Yes' : 'No'}
Has Email: ${lead.email || lead.emailGuesses?.length > 0 ? 'Yes' : 'No'}
Rating: ${lead.rating}/5 (${lead.reviewCount} reviews)
Services: ${(lead.keyServices || []).join(', ') || 'Unknown'}
AI Summary: ${lead.aiSummary || 'Not available'}

Score this lead and respond with ONLY valid JSON:
{
  "score": "High/Medium/Low",
  "scoreValue": 85,
  "reasoning": "brief explanation",
  "breakdown": {
    "websiteQuality": 20,
    "keywordMatch": 25,
    "reviewScore": 20,
    "contactCompleteness": 20
  }
}

Scoring guide:
- High (70-100): Strong match, good online presence, easily contactable
- Medium (40-69): Decent match, some contact info
- Low (0-39): Poor match or minimal info`;

    try {
      const raw = await this.callClaude(prompt, 500);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      const data = JSON.parse(jsonMatch[0]);
      return {
        score: data.score || 'Medium',
        scoreValue: Math.min(100, Math.max(0, data.scoreValue || 50)),
        scoreReasoning: data.reasoning || '',
        scoreBreakdown: data.breakdown || {
          websiteQuality: 15,
          keywordMatch: 15,
          reviewScore: 10,
          contactCompleteness: 10
        }
      };
    } catch (error) {
      return this.fallbackScore(lead);
    }
  }

  fallbackScore(lead) {
    let score = 0;
    const breakdown = { websiteQuality: 0, keywordMatch: 0, reviewScore: 0, contactCompleteness: 0 };

    if (lead.website) { score += 25; breakdown.websiteQuality = 25; }
    if (lead.phone) { score += 15; breakdown.contactCompleteness += 15; }
    if (lead.email || (lead.emailGuesses && lead.emailGuesses.length > 0)) { score += 10; breakdown.contactCompleteness += 10; }
    if (lead.rating >= 4) { score += 20; breakdown.reviewScore = 20; }
    else if (lead.rating >= 3) { score += 10; breakdown.reviewScore = 10; }
    if (lead.reviewCount > 50) { score += 10; breakdown.reviewScore += 10; }
    if (lead.aiSummary) { score += 20; breakdown.keywordMatch = 20; }

    const label = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
    return { score: label, scoreValue: score, scoreBreakdown: breakdown };
  }

  /**
   * Guess email formats for a business
   */
  guessEmailFormats(businessName, website) {
    if (!website) return [];

    const domain = website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    if (!domain) return [];

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const firstName = slug.substring(0, 6);

    return [
      `info@${domain}`,
      `contact@${domain}`,
      `hello@${domain}`,
      `admin@${domain}`,
      `${firstName}@${domain}`,
      `sales@${domain}`
    ].filter(e => e.length < 100);
  }
}

module.exports = new AIEnrichmentService();
