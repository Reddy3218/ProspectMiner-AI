// AI Lead Scoring Engine

function calculateLeadScore(lead, query) {
  let score = 0;

  // website availability
  if (lead.website) {
    score += 30;
  }

  // rating score
  if (lead.rating) {
    score += lead.rating * 10;
  }

  // reviews
  if (lead.reviewCount) {
    score += Math.min(lead.reviewCount / 10, 20);
  }

  // keyword match
  if (
    lead.name &&
    lead.name.toLowerCase().includes(query.toLowerCase())
  ) {
    score += 20;
  }

  return Math.min(Math.round(score), 100);
}

function classifyLead(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function analyzeLead(lead, query) {
  const score = calculateLeadScore(lead, query);

  return {
    score,
    priority: classifyLead(score),
    analyzedAt: new Date()
  };
}

module.exports = {
  analyzeLead
};
