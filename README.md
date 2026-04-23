# SMA Dashboard — Social Media Analytics

A fullstack social media analytics platform built with **Next.js 14** (frontend) and **FastAPI** (backend). It scrapes Twitter/X and Facebook posts via Apify, stores them in MongoDB, and runs 12 ML-powered analytics modules — sentiment analysis, trend prediction, influencer detection, competitor analysis, and more — all visualised in a real-time dashboard.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [External Services Setup](#external-services-setup)
  - [MongoDB Atlas](#1-mongodb-atlas)
  - [Apify](#2-apify)
- [Backend Setup (FastAPI)](#backend-setup-fastapi)
- [Frontend Setup (Nextjs)](#frontend-setup-nextjs)
- [Running the Application](#running-the-application)
- [Seeding the Database](#seeding-the-database)
- [Environment Variables Reference](#environment-variables-reference)
- [Project Structure](#project-structure)
- [Analytics Modules](#analytics-modules)
- [API Endpoints](#api-endpoints)
- [Available Pages](#available-pages)
- [Tech Stack](#tech-stack)

---

## Architecture Overview

```
Browser
  └── Next.js frontend (port 3000)
        └── Custom hooks (useModuleData)
              └── FastAPI backend (port 8000)
                    ├── Apify scraper → Twitter/X & Facebook posts
                    └── MongoDB Atlas → stores & caches posts
```

The user selects a **keyword** and **platform** in the dashboard. The frontend sends that to the backend, which either fetches live data from Apify or returns cached results from MongoDB (5-minute TTL). The 12 analytics modules then process the data and return structured results for each dashboard widget.

---

## Prerequisites

Make sure the following are installed on your machine before proceeding.

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| pnpm | 8+ | `npm install -g pnpm` |
| Python | 3.10+ | https://python.org |
| pip | latest | bundled with Python |
| Git | any | https://git-scm.com |

> **Tip:** Check your versions: `node -v`, `pnpm -v`, `python --version`, `pip --version`

---

## External Services Setup

The backend requires two external services. Set these up before running anything locally.

### 1. MongoDB Atlas

MongoDB Atlas is the cloud database that stores scraped posts and session metadata.

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new **free tier cluster** (M0 Sandbox).
3. Under **Database Access**, create a database user with a username and password. Save these.
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` to allow all IPs during development).
5. Click **Connect** on your cluster → **Connect your application** → copy the connection string.
6. Replace `<username>` and `<password>` in the string with your database user credentials.

The connection string will look like:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/sma_db?retryWrites=true&w=majority
```

> **Local alternative:** If you prefer running MongoDB locally, install [MongoDB Community Edition](https://www.mongodb.com/try/download/community) and use `mongodb://localhost:27017/sma_db` as your URI.

### 2. Apify

Apify provides the web scraping actors that collect posts from Twitter/X and Facebook.

1. Go to [apify.com](https://apify.com) and create a free account.
2. Navigate to **Settings → Integrations** in your Apify dashboard.
3. Copy your **Personal API Token**.

The two scraper actors used by default are:
- `apidojo/tweet-scraper` — for Twitter/X
- `apify/facebook-posts-scraper` — for Facebook

> **Free tier note:** Apify's free tier includes $5/month of compute credits, which covers moderate usage. Each scrape run consumes a small amount of credits depending on the number of posts fetched.

---

## Backend Setup (FastAPI)

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create a Python virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` prefixed in your terminal prompt once activated.

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, Uvicorn, PyMongo, the Apify client, VADER sentiment, scikit-learn, NetworkX, pandas, and all other backend dependencies.

### 4. Configure environment variables

Copy the example env file:

```bash
# Windows (Command Prompt)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
APIFY_API_KEY=your_apify_api_token_here
TWITTER_ACTOR_ID=apidojo/tweet-scraper
FACEBOOK_ACTOR_ID=apify/facebook-posts-scraper
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/sma_db?retryWrites=true&w=majority
```

- `APIFY_API_KEY` — your token from the Apify dashboard (required for live scraping)
- `TWITTER_ACTOR_ID` / `FACEBOOK_ACTOR_ID` — leave as-is unless you switch to different actors
- `MONGODB_URI` — your Atlas connection string from the previous step

### 5. Start the backend server

```bash
uvicorn main:app --reload --port 8000
```

- `--reload` enables hot-reloading during development (remove in production)
- The API will be available at `http://localhost:8000`
- Interactive Swagger docs at `http://localhost:8000/docs`
- Health check endpoint: `http://localhost:8000/health`

---

## Frontend Setup (Nextjs)

### 1. Return to the project root

```bash
cd ..
```

### 2. Install Node.js dependencies

```bash
pnpm install
```

> **pnpm not installed?** Run `npm install -g pnpm` first.

### 3. Start the development server

```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`.

---

## Running the Application

You need **both servers running simultaneously**. Open two separate terminal windows.

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate          # Windows
# or: source venv/bin/activate   (macOS/Linux)
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
pnpm dev
```

Open `http://localhost:3000` in your browser. Enter a keyword (e.g. `AI`) and select a platform (`Twitter` or `Facebook`) in the dashboard search bar. The backend will scrape live data and return analytics results across all 12 widgets.

---

## Seeding the Database

A sample CSV dataset is included for testing without making live Apify calls. To load it into MongoDB:

```bash
cd backend
python seed_db.py
```

This loads `backend/data/social_media_analytics_full_dataset_with_demographics.csv` into the `posts` collection. After seeding, the dashboard will display data for the pre-loaded keywords immediately, without consuming any Apify credits.

---

## Environment Variables Reference

All environment variables live in `backend/.env`. There are no frontend environment variables — the frontend calls the backend at `http://localhost:8000` by default. To change this (e.g. for deployment), update the base URL in `hooks/use-module-data.ts`.

| Variable | Required | Default | Description |
|---|---|---|---|
| `APIFY_API_KEY` | Yes | — | Apify personal API token |
| `TWITTER_ACTOR_ID` | No | `apidojo/tweet-scraper` | Apify actor for Twitter/X |
| `FACEBOOK_ACTOR_ID` | No | `apify/facebook-posts-scraper` | Apify actor for Facebook |
| `MONGODB_URI` | Yes | — | MongoDB connection string |

---

## Project Structure

```
sma-dashboard/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages (login, register, reset-password, verification)
│   ├── (main)/                 # Protected app shell
│   │   └── (home)/             # Main analytics dashboard
│   ├── layout.tsx              # Root layout
│   └── providers.tsx           # Jotai, theme, and UI providers
│
├── components/
│   ├── ui/                     # Base design system components (buttons, modals, tables, etc.)
│   ├── widgets/                # 12 analytics widgets (one per backend module)
│   └── settings-modal/         # Settings drawer with sub-sections
│
├── hooks/
│   ├── use-module-data.ts      # Fetches data from backend API endpoints
│   └── ...
│
├── lib/
│   └── atoms.ts                # Jotai atoms for keyword/platform global state
│
├── backend/
│   ├── main.py                 # FastAPI app — all route definitions
│   ├── db.py                   # MongoDB connection and query helpers
│   ├── data_fetcher.py         # Apify integration and 5-minute cache logic
│   ├── apify_fetcher.py        # Raw Apify API client wrapper
│   ├── seed_db.py              # One-time database seeder from CSV
│   ├── models/                 # Analytics modules (12 files, one per feature)
│   ├── data/                   # Sample CSV dataset
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variable template
│
├── public/                     # Static assets (flags, icons, images)
├── utils/                      # cn, date/number formatters, Tailwind variants
├── tailwind.config.ts          # Custom AlignUI design tokens
├── next.config.mjs             # Next.js config (static export, SVGR)
└── package.json
```

---

## Analytics Modules

Each file in `backend/models/` maps directly to a widget on the dashboard.

| Module | Description |
|---|---|
| `sentiment.py` | VADER-based sentiment scoring (positive / negative / neutral) |
| `trending.py` | Detects trending topics and hashtags from recent posts |
| `network.py` | Network graph analysis of user interactions via NetworkX |
| `recommendation.py` | Content recommendations based on engagement patterns |
| `fake_news.py` | Fake news and misinformation signal detection |
| `segmentation.py` | K-means user segmentation by demographics and behaviour |
| `data_viz.py` | Aggregated time-series and distribution data for charts |
| `ad_campaign.py` | Ad campaign performance and reach analysis |
| `influencer.py` | Identifies high-reach influencer accounts in the dataset |
| `monitoring.py` | Real-time monitoring metrics and alert signals |
| `competitor.py` | Comparative competitor analysis across keywords |
| `prediction.py` | ML-based popularity and trend prediction |

---

## API Endpoints

All endpoints accept `keyword` and `platform` as query parameters.

```
GET /health                  Health check
GET /api/posts               Raw post data from MongoDB
GET /api/sentiment           Sentiment analysis results
GET /api/trending            Trending topics
GET /api/network             Network graph metrics
GET /api/recommendation      Content recommendations
GET /api/fake-news           Fake news signals
GET /api/segmentation        User segmentation clusters
GET /api/data-viz            Chart-ready aggregated data
GET /api/ad-campaign         Ad campaign metrics
GET /api/influencer          Top influencers
GET /api/monitoring          Monitoring and alerts
GET /api/competitor          Competitor comparison
GET /api/prediction          Trend predictions
```

**Example:**
```
GET http://localhost:8000/api/sentiment?keyword=AI&platform=twitter
```

Full interactive documentation is available at `http://localhost:8000/docs` when the backend is running.

---

## Available Pages

| Route | Description |
|---|---|
| `/` | Main analytics dashboard with 12 widgets |
| `/analytics` | Detailed analytics view |
| `/products` | Products listing |
| `/orders` | Orders management |
| `/add-product` | Product creation flow |
| `/login` | Sign in |
| `/register` | Create account |
| `/reset-password` | Password reset |
| `/verification` | Email verification |

---

## Tech Stack

**Frontend**
- [Next.js 14](https://nextjs.org) — React framework with App Router
- [TypeScript](https://typescriptlang.org) — Static typing
- [Tailwind CSS](https://tailwindcss.com) — Utility-first styling with custom AlignUI tokens
- [Jotai](https://jotai.org) — Atomic state management
- [Recharts](https://recharts.org) — Composable chart library
- [Framer Motion](https://framer.com/motion) — Animations
- [React Leaflet](https://react-leaflet.js.org) — Interactive maps
- [Radix UI](https://radix-ui.com) — Accessible headless UI primitives

**Backend**
- [FastAPI](https://fastapi.tiangolo.com) — Async Python web framework
- [Uvicorn](https://uvicorn.org) — ASGI server
- [MongoDB](https://mongodb.com) + [PyMongo](https://pymongo.readthedocs.io) — Database
- [Apify](https://apify.com) — Web scraping platform
- [VADER Sentiment](https://github.com/cjhutto/vaderSentiment) — Sentiment analysis
- [scikit-learn](https://scikit-learn.org) — K-means clustering and ML models
- [NetworkX](https://networkx.org) — Graph and network analysis
- [pandas](https://pandas.pydata.org) + [NumPy](https://numpy.org) — Data processing
