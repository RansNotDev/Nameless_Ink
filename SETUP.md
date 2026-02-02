# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env` file in the root directory with:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   FIRESTORE_PROJECT_ID=your_firestore_project_id
   FIRESTORE_KEY_FILE=path/to/service-account-key.json
   RATING_THRESHOLD=3
   ```

3. **Get API Keys**
   
   - **Gemini API**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Firestore**: Set up in [Google Cloud Console](https://console.cloud.google.com)

4. **Run Locally**
   
   Frontend (static files):
   ```bash
   # Option 1: Python
   python -m http.server 8000
   
   # Option 2: Node.js
   npx http-server -p 8000
   ```
   
   Backend (serverless functions):
   ```bash
   vercel dev
   ```

5. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## Project Structure

```
nameless-ink/
├── index.html          # Main HTML file
├── css/                # Stylesheets
├── js/                 # Frontend JavaScript
├── api/                # Vercel serverless functions
├── utils/              # Backend utilities
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
└── .env                # Environment variables (create this)
```

## Notes

- Frontend is pure HTML/CSS/JavaScript - no build step needed
- Backend uses Vercel serverless functions
- All API endpoints are in `/api` folder
- Environment variables are required for backend to work
