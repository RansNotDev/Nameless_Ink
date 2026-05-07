# Setup Guide



## Quick Start



1. **Install Dependencies**

   ```bash

   npm install

   ```



2. **Environment Variables**



   Copy the example file and edit `.env` (never commit real secrets):

   ```bash

   copy .env.example .env

   ```

   On macOS/Linux: `cp .env.example .env`



   | Variable | Purpose |

   |----------|---------|

   | `LOCAL_DEV` | `true` = in-memory DB + mock ratings (good for first local run). `false` = real Gemini + Firestore. |

   | `GEMINI_API_KEY` | Required when `LOCAL_DEV=false`. From [Google AI Studio](https://makersuite.google.com/app/apikey). |

   | `GEMINI_MODEL` | Optional. Default `gemini-1.5-flash`. |

   | `FIRESTORE_PROJECT_ID` | Required when `LOCAL_DEV=false`. |

   | `FIRESTORE_KEY_FILE` | Path to service account JSON locally; on Vercel use project env / ADC instead. |

   | `RATING_THRESHOLD` | Minimum rating (1–5) to publish; default `3`. |



3. **Firestore Indexes (production)**



   Queries use compound filters + `orderBy`. Deploy indexes once:

   ```bash

   firebase deploy --only firestore:indexes

   ```

   Or create the composite indexes from errors shown in the Firebase Console. Definitions are in `firestore.indexes.json`.



4. **Run Locally**

   Recommended (no Vercel login; loads `.env` automatically):

   ```bash

   npm run dev

   ```

   Open the URL printed (starts at `http://localhost:3000`; if that port is busy the dev server tries the next ports up to 10 times). Override with `PORT`, e.g. PowerShell: `$env:PORT=3001; npm run dev`.

   **Vercel CLI (`npm run dev:vercel`):** When `vercel link` asks where your code lives, use **`.`** or leave the default repo root. Do **not** enter `././` — Vercel rejects root directories that start with `./`.

   If the repo is linked with `vercel link`, you can use:

   ```bash

   npm run dev:vercel

   ```



5. **Deploy to Vercel**

   ```bash

   npm run deploy

   ```



## Project Structure



```

nameless-ink/

├── index.html          # Main HTML file

├── css/                # Stylesheets

├── js/                 # Frontend JavaScript

├── scripts/            # Local dev server (npm run dev)

├── api/                # Vercel serverless functions

├── utils/              # Backend utilities

├── package.json        # Dependencies

├── vercel.json         # Vercel configuration

├── firestore.indexes.json

├── .env.example        # Template (safe to commit)

└── .env                # Your secrets (gitignored — create locally)

```



## Notes



- Frontend is plain HTML/CSS/JS — no bundler.

- Backend is Vercel Node serverless functions under `api/`.

- Running a separate static server on another port **without** a proxy will break `/api` calls; prefer `npm run dev`.

