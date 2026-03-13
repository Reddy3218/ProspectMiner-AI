# 🚀 ProspectMiner AI — Domain-Specific Lead Mining Engine

ProspectMiner-AI is an AI-powered lead generation and prospect intelligence platform that automatically scrapes potential business leads from the internet and ranks them based on their estimated revenue potential.

The system leverages web scraping, data enrichment, and AI-based scoring models to identify high-value prospects and help sales teams focus on leads that are more likely to convert.

By automating the lead discovery and prioritization process, ProspectMiner-AI significantly reduces manual research time and improves the efficiency of sales and marketing teams.

## Problem statement

Modern sales teams spend a significant amount of time manually searching for potential customers across websites, directories, and social platforms. This process has several limitations:

* Manual prospect discovery is time-consuming

* Leads are often unqualified or low value

* Sales teams lack data-driven prioritization

* Valuable prospects may be missed due to limited research bandwidth

There is a need for an intelligent system that can automatically discover, analyze, and rank leads based on their potential business value.


## Solution

ProspectMiner-AI addresses this problem by combining automated web scraping with AI-driven lead scoring.

The system performs the following workflow:

### Data Collection

Scrapes business information from online sources such as company directories, websites, and public data platforms.

### Data Processing & Enrichment

Extracts key attributes such as company name, industry, location, size, and digital presence.

### AI-Based Revenue Potential Scoring

Applies AI models to evaluate the probability that a lead can generate high revenue.

### Lead Ranking

Prospects are ranked according to their estimated revenue potential.

### Actionable Insights

Sales teams receive a prioritized list of leads with supporting data.

---

## 📁 Project Structure

```
prospectminer/
├── backend/                  # Node.js + Express + MongoDB
│   ├── models/
│   │   ├── Lead.js           # Lead schema (AI fields, scoring, status)
│   │   └── Campaign.js       # Campaign schema with progress tracking
│   ├── routes/
│   │   ├── search.js         # POST /api/search — create & start campaigns
│   │   ├── campaigns.js      # CRUD + pause/restart campaigns
│   │   ├── leads.js          # CRUD + CSV export
│   │   └── stats.js          # Dashboard stats
│   ├── services/
│   │   ├── scraperService.js     # Puppeteer stealth scraping (Google Maps)
│   │   ├── aiEnrichmentService.js # Claude AI enrichment + lead scoring
│   │   └── miningService.js      # Orchestrates scrape → enrich → score
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/                 # React 18 SPA
    ├── public/index.html
    └── src/
        ├── pages/
        │   ├── Dashboard.js       # Stats + chart + recent campaigns
        │   ├── NewSearch.js       # Create a new lead mining campaign
        │   ├── Campaigns.js       # List all campaigns
        │   ├── CampaignDetail.js  # Live progress + leads table (polling)
        │   ├── LeadsPage.js       # All leads with filter + pagination
        │   └── LeadDetail.js      # Full AI insights + score breakdown
        ├── components/
        │   └── Layout.js          # Sidebar nav + top bar
        ├── services/
        │   └── api.js             # Axios API client
        ├── App.js
        ├── index.js
        └── index.css              # Dark theme design system
```

---

## ⚡ Features

| Feature | Description |
|---|---|
| **Stealth Scraping** | Puppeteer + stealth plugin + UA rotation → avoids bot detection |
| **AI Enrichment** | Claude visits each website, extracts insights & services |
| **Lead Scoring** | AI rates leads High / Medium / Low with score breakdown |
| **Email Guessing** | Generates 6 plausible email formats per business |
| **Live Progress** | Campaign detail page polls for real-time status |
| **CSV Export** | One-click export of filtered leads |
| **Demo Mode** | Falls back to realistic mock data if scraping is blocked |

---

## 🛠 Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- Anthropic API Key

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your keys:
#   MONGODB_URI=mongodb://localhost:27017/prospectminer
#   ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Backend runs on **http://localhost:5000**

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000** and proxies API calls to port 5000.

---

## 🔑 Environment Variables (Backend)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prospectminer
ANTHROPIC_API_KEY=your_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 🗺 API Endpoints

### Search / Campaigns
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/search` | Create + start a new mining campaign |
| GET | `/api/search/:id/status` | Get campaign status |
| GET | `/api/campaigns` | List all campaigns |
| GET | `/api/campaigns/:id` | Get campaign with lead count |
| DELETE | `/api/campaigns/:id` | Delete campaign + leads |
| POST | `/api/campaigns/:id/pause` | Pause running campaign |
| POST | `/api/campaigns/:id/restart` | Restart campaign |

### Leads
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads` | Get leads (filter by campaignId, score, search) |
| GET | `/api/leads/:id` | Get single lead with full AI data |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| GET | `/api/leads/export/csv` | Download CSV export |

### Stats
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats` | Dashboard stats (totals, distribution) |

---

## 🏗 Architecture & Data Flow

```
User starts search
    ↓
Campaign created in MongoDB (status: idle)
    ↓
miningService.startMining() [background, non-blocking]
    ↓
scraperService.scrapeGoogleMaps()
  → Puppeteer + stealth plugin
  → Rotated user agents
  → Scroll to load more results
  → Falls back to demo data if blocked
    ↓
Leads saved to MongoDB (status: scraping)
    ↓
For each lead (if AI enrichment enabled):
  → scraperService.scrapeWebsiteContent(lead.website)
  → aiEnrichmentService.enrichLead(websiteContent, query)
      → Claude extracts: summary, categories, services, insights
  → lead.emailGuesses = aiEnrichmentService.guessEmailFormats()
    ↓
For each lead (if lead scoring enabled):
  → aiEnrichmentService.scoreLead(lead, query)
      → Claude rates: High / Medium / Low + 0-100 score
      → Breakdown: websiteQuality, keywordMatch, reviewScore, contactCompleteness
    ↓
Campaign marked: completed
Frontend polling picks up progress every 4 seconds
```

---

## 📦 Tech Stack

### Backend
- **Express.js** — REST API
- **Mongoose** — MongoDB ODM
- **Puppeteer Extra** — Headless Chrome with stealth plugin
- **Axios** — Anthropic API calls
- **Helmet + Rate Limiting** — Security

### Frontend
- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Recharts** — Score distribution bar chart
- **React Hot Toast** — Notifications
- **Lucide React** — Icons
- **Custom CSS** — Dark design system (no Tailwind/MUI dependency)

---

## 🎨 Design System

The frontend uses a custom dark theme with CSS variables:
- **Font Display:** Syne (headings)
- **Font Mono:** DM Mono (data, codes)
- **Font Body:** Inter (copy)
- **Primary:** `#00d4ff` (cyan)
- **Success/High:** `#00e5a0` (green)
- **Warning/Medium:** `#ffd166` (yellow)
- **Danger/Low:** `#ff6b6b` (red)

---

## 🔒 Notes on Production Deployment

1. **Puppeteer on servers** — Use `--no-sandbox` (already configured) and ensure Chrome is installed
2. **Rate limiting** — The scraper has built-in delays; avoid hammering Google Maps
3. **API Key security** — Never commit your `.env` file
4. **MongoDB** — Use MongoDB Atlas for production with proper auth
5. **Demo mode** — If real scraping returns 0 results, mock data is generated automatically for testing

---

## 📄 License

MIT — Use freely for commercial or personal projects.
