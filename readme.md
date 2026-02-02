<div align="center">

# 🖋️ NAMELESS INK

### Anonymous quotes, human-written. AI-rated.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange)](https://github.com)
[![Stack: Free Tier](https://img.shields.io/badge/Stack-Free%20Tier-green)](https://github.com)

*A lightweight web platform where human creativity meets AI quality control—without the noise.*

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Core Philosophy](#-core-philosophy)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running Locally](#running-locally)
- [Usage](#-usage)
- [AI Rating System](#-ai-rating-system)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Code of Conduct](#-code-of-conduct)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About

**Nameless Ink** is a minimalist web platform that celebrates anonymous human expression. Unlike platforms that use AI to generate content, Nameless Ink uses AI solely as a quality filter—rating human-written quotes on a 1–5 scale to ensure only thoughtful, meaningful content gets published.

### What Makes It Different?

- ✅ **100% Human-Written Content** - AI never generates or rewrites quotes
- ✅ **True Anonymity** - No accounts, no tracking, no identity stored
- ✅ **AI as Quality Gate** - AI rates content, humans create it
- ✅ **Zero Cost** - Built entirely on free-tier services
- ✅ **Privacy-First** - If the database leaks, there's nothing to steal

> **Old truth:** Words matter more when no one's signing them.

---

## ✨ Features

- **Anonymous Quote Submission** - Write and share quotes without identity
- **AI Quality Rating** - Automatic 1–5 rating for all submissions
- **Smart Content Filtering** - Only quality content (rating ≥ 3) gets published
- **Anonymous Replies** - Engage with quotes through anonymous comments
- **Real-Time Rating Display** - See AI ratings and feedback instantly
- **Zero-Tracking Architecture** - No cookies, no analytics, no surveillance
- **Free Forever** - Built on free-tier services, no hidden costs

---

## 🧠 Core Philosophy

1. **No identity, no ego** - Anonymity removes bias and ego from expression
2. **Human creativity first** - AI supports, never replaces, human thought
3. **AI as a filter, not a voice** - Technology judges quality, not creates it
4. **Free stack, low friction** - Accessible to everyone, forever
5. **Ship fast, keep it simple** - Complexity is the enemy of execution

---

## 🏗️ Architecture

### System Overview

Nameless Ink follows a clean, serverless architecture with four distinct layers:

```
┌─────────────┐
│  Frontend   │  ← User Interface (Vercel)
└──────┬──────┘
       │
┌──────▼──────┐
│   Backend   │  ← Serverless Functions (Vercel)
└──────┬──────┘
       │
┌──────▼──────┐
│  AI Layer   │  ← Gemini API (Rating Only)
└──────┬──────┘
       │
┌──────▼──────┐
│ Data Layer  │  ← Firestore (Content Storage)
└─────────────┘
```

### 1. Frontend (Public Face)

**Platform:** Vercel  
**Technology:** React/Next.js (or vanilla JS)

**Responsibilities:**
- Quote submission interface
- Anonymous reply system
- Display approved content with ratings
- Real-time feedback display

**What it never does:**
- Generate text
- Judge quality
- Store user data
- Access AI keys directly

### 2. Backend (The Gatekeeper)

**Platform:** Vercel Serverless Functions  
**Technology:** Node.js/Python

**Responsibilities:**
- Receive quotes and comments
- Forward to AI for rating
- Apply publish rules (rating threshold)
- Return rating + feedback to frontend
- Manage database operations

**Key Functions:**
- `POST /api/submit-quote` - Submit new quote
- `POST /api/submit-comment` - Submit reply
- `GET /api/quotes` - Fetch approved quotes
- `POST /api/rate` - Internal AI rating endpoint

### 3. AI Layer (The Judge)

**Service:** Google Gemini API (Free Tier)

**Responsibilities:**
- Read human-written text
- Rate content 1–5 based on quality
- Provide brief feedback explanation
- Detect toxic or harmful content

**What it never does:**
- Write quotes
- Rewrite quotes
- Improve quotes
- Store any data

### 4. Data Layer (Memory, Not Identity)

**Database:** Google Firestore (Free Tier)

**Stores:**
- Quote text (anonymized)
- AI rating (1–5)
- Anonymous comments
- Timestamps
- Approval status

**Never stores:**
- Names
- Email addresses
- IP addresses
- User accounts
- Browser fingerprints
- Any identifying information

---

## 🛠️ Tech Stack

| Component | Technology | Tier |
|-----------|-----------|------|
| **Frontend** | React/Next.js | Vercel (Free) |
| **Backend** | Node.js/Python | Vercel Serverless (Free) |
| **AI Service** | Google Gemini API | Free Tier |
| **Database** | Google Firestore | Free Tier |
| **Hosting** | Vercel | Free Tier |
| **Total Cost** | - | **₱0.00** |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (for local development)
- npm or yarn
- Google Cloud account (for Gemini API & Firestore)
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nameless-ink.git
   cd nameless-ink
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   FIRESTORE_PROJECT_ID=your_firestore_project_id
   FIRESTORE_KEY_FILE=path/to/service-account-key.json
   RATING_THRESHOLD=3
   ```

### Configuration

1. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

2. **Set up Firestore**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Firestore API
   - Create a service account and download the key
   - Add the key path to your `.env` file

3. **Configure Rating Threshold**
   - Set `RATING_THRESHOLD` in `.env` (default: 3)
   - Only quotes with rating ≥ threshold will be published

### Running Locally

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`

---

## 📖 Usage

### Submitting a Quote

1. Navigate to the home page
2. Enter your quote in the text area
3. Click "Submit Quote"
4. Wait for AI rating (1–5)
5. If rating ≥ threshold, quote is published
6. If rating < threshold, quote is rejected with feedback

### Replying to Quotes

1. Click on any published quote
2. Enter your anonymous reply
3. Submit (same rating process applies)
4. Reply appears if it meets quality threshold

### Viewing Content

- All published quotes are displayed chronologically
- Each quote shows its AI rating (1–5)
- Comments appear below their parent quotes
- No user information is ever displayed

---

## 🎯 AI Rating System

The AI rates all submissions on a 1–5 scale:

| Rating | Description | Status |
|--------|-------------|--------|
| **1** | Noise, nonsense, or trash | ❌ Rejected |
| **2** | Weak thought, barely formed | ❌ Rejected |
| **3** | Fine, readable, acceptable | ✅ Published |
| **4** | Strong and thoughtful | ✅ Published |
| **5** | Sharp, memorable, hits hard | ✅ Published |

**Default Threshold:** Rating ≥ 3 (configurable)

---

## 📁 Project Structure

```
nameless-ink/
├── frontend/
│   ├── components/
│   │   ├── QuoteForm.jsx
│   │   ├── QuoteList.jsx
│   │   └── CommentSection.jsx
│   ├── pages/
│   │   └── index.jsx
│   └── styles/
│       └── globals.css
├── backend/
│   ├── api/
│   │   ├── submit-quote.js
│   │   ├── submit-comment.js
│   │   ├── get-quotes.js
│   │   └── rate-content.js
│   └── utils/
│       ├── ai-rater.js
│       └── db-handler.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🤝 Contributing

We welcome contributions! Nameless Ink is built by the community, for the community.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Write clear commit messages
   - Test your changes locally
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines

- ✅ Keep it simple and focused
- ✅ Maintain anonymity-first principles
- ✅ No breaking changes without discussion
- ✅ Update documentation for new features
- ✅ Test all changes before submitting
- ✅ Follow the existing code style

### Areas We Need Help

- 🐛 Bug fixes
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🔒 Security improvements
- 🌐 Internationalization
- 🧪 Testing coverage

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or experience level.

### Our Standards

- Be respectful and constructive
- Accept feedback gracefully
- Focus on what is best for the community
- Show empathy towards others

### Enforcement

Instances of unacceptable behavior may result in temporary or permanent bans from the project.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Nameless Ink Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Google Gemini API** - For providing free-tier AI rating capabilities
- **Vercel** - For hosting and serverless infrastructure
- **Firestore** - For free database hosting
- **All Contributors** - For making this project possible

---

## 📞 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/nameless-ink/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/nameless-ink/discussions)
- **Email:** [Your Email] (optional)

---

<div align="center">

**Made with ❤️ by the Nameless Ink community**

*It's not trying to be Twitter. It's trying to be quiet.*

[⬆ Back to Top](#-nameless-ink)

</div>
