# Vercel Deployment Guide — TitleFlow Infrastructure

This project is configured for deployment on [Vercel](https://vercel.com). It leverages Vercel's hybrid architecture:
1. **Frontend**: Vite + React SPA compiled to static assets and served across Vercel's global Edge CDN with client-side routing.
2. **Backend**: FastAPI Python backend running as a Serverless ASGI Function via `api/index.py`.
3. **Routing**: `vercel.json` rewrites `/api/*` to the Python serverless function and all other paths to the React single-page app.

---

## Deployment Options

### Method 1: Deploy via GitHub (Recommended & Automated)

1. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Sign in with your GitHub account.
   - Select your repository and click **Import**.
   - Leave the root directory as `./` (Vercel automatically detects `vercel.json`).

3. **Configure Environment Variables** (Optional for basic preview, recommended for production):
   In the Vercel deployment dashboard under **Environment Variables**, add:
   - `SECRET_KEY`: Any secure random 32-character string (e.g. `openssl rand -hex 32`).
   - `DATABASE_URL`: Your PostgreSQL connection string (from Neon, Supabase, Vercel Postgres, or AWS RDS).
     *(If omitted, the serverless function automatically falls back to `/tmp/title_escrow.db` for ephemeral demo execution.)*
   - `AI_PROVIDER`: `fallback` (default) or `openai` / `gemini`.
   - `AI_API_KEY`: API key if using an external LLM provider.

4. **Click Deploy**:
   Vercel will install dependencies, build the frontend bundle, package the Python serverless backend, and provide your live `https://*.vercel.app` URL.

---

### Method 2: Deploy via Vercel CLI

If you prefer deploying directly from your local terminal:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Authenticate with Vercel**:
   ```bash
   vercel login
   ```
   Follow the prompt in your browser to authorize your account.

3. **Deploy Preview**:
   ```bash
   vercel
   ```
   Accept default options (the settings in `vercel.json` will be automatically applied).

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## Configuration Details

### `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `api/index.py`
Exposes the FastAPI `app` instance with dynamic path resolution and runtime detection for Vercel's serverless environment (`/tmp` fallback).

### Database in Serverless Environments
- On Vercel, the filesystem outside `/tmp` is read-only.
- For a persistent multi-user database in production, connect a hosted PostgreSQL database (such as **Neon**, **Supabase**, or **Vercel Postgres**) by setting the `DATABASE_URL` environment variable in your Vercel project dashboard.
- The SQLAlchemy schema and models automatically utilize native `JSONB` for PostgreSQL and standard `JSON` for SQLite.
