# Deployment Setup Guide

This guide explains how to set up automatic deployments to Vercel (frontend) and Render (backend) using GitHub Actions.

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **Render Account**: Sign up at https://render.com
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Set Up Vercel (Frontend)

### 1.1 Create Vercel Project

1. Go to https://vercel.com and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Root Directory**: Set to `frontend` (in Settings → General → Root Directory)
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 1.2 Get Vercel Credentials

1. Go to https://vercel.com/account/tokens
2. Create a new token (name it "GitHub Actions" or similar)
3. Copy the token - you'll need it for GitHub Secrets

4. Get your **Organization ID**:
   - Go to https://vercel.com/[your-username]/settings
   - Copy the **Team ID** (this is your org-id)

5. Get your **Project ID**:
   - Go to your project settings
   - In the General tab, you'll see the **Project ID**

### 1.3 Configure Environment Variables in Vercel

In your Vercel project settings → Environment Variables, add:

- `NEXT_PUBLIC_BACKEND_URL`: Your Render backend URL (e.g., `https://govtwool-backend.onrender.com`)
- `NEXT_PUBLIC_NETWORK`: `mainnet` (or `preview` for testnet)

## Step 2: Set Up Render (Backend)

### 2.1 Create Render Service

1. Go to https://render.com and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `govtwool-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Rust`
   - **Build Command**: `cargo build --release`
   - **Start Command**: `./target/release/govtwool-backend`

### 2.2 Get Render Credentials

1. Go to https://dashboard.render.com/account/api-keys
2. Create a new API key (name it "GitHub Actions")
3. Copy the API key - you'll need it for GitHub Secrets

4. Get your **Service ID**:
   - Go to your service dashboard
   - The Service ID is in the URL: `https://dashboard.render.com/web/[SERVICE_ID]`
   - Or go to Settings → Info → Service ID

### 2.3 Configure Environment Variables in Render

In your Render service settings → Environment, add:

- `BLOCKFROST_API_KEY`: Your Blockfrost API key (required)
- `BLOCKFROST_NETWORK`: `mainnet` (or `preview`)
- `KOIOS_BASE_URL`: `https://preview.koios.rest/api/v1` (optional)
- `CACHE_ENABLED`: `true` (optional)
- `CACHE_MAX_ENTRIES`: `10000` (optional)

**Note**: Render automatically sets the `PORT` environment variable, so you don't need to set it.

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add the following:

### Required Secrets

#### Vercel Secrets
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization/team ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

#### Render Secrets
- `RENDER_API_KEY`: Your Render API key
- `RENDER_SERVICE_ID`: Your Render service ID

#### Backend Build Secrets (Optional, for CI verification)
- `BLOCKFROST_API_KEY`: Your Blockfrost API key (for CI builds)
- `BLOCKFROST_NETWORK`: `mainnet` (optional)
- `KOIOS_BASE_URL`: `https://preview.koios.rest/api/v1` (optional)

## Step 4: Verify Deployment Workflow

The deployment workflow (`.github/workflows/deploy.yml`) will automatically:

1. **Deploy Frontend to Vercel** when you push to `main`
2. **Trigger Backend Deployment on Render** when you push to `main`

### Manual Deployment

You can also trigger deployments manually:

1. Go to **Actions** tab in GitHub
2. Select **"Deploy"** workflow
3. Click **"Run workflow"**
4. Select the branch and click **"Run workflow"**

## Step 5: Test the Deployment

1. Push a change to the `main` branch
2. Go to the **Actions** tab in GitHub
3. Watch the deployment workflow run
4. Check:
   - Vercel dashboard for frontend deployment
   - Render dashboard for backend deployment

## Troubleshooting

### Vercel Deployment Fails

- **Check**: Vercel token, org ID, and project ID are correct
- **Check**: Root directory is set to `frontend` in Vercel dashboard
- **Check**: Environment variables are set in Vercel dashboard
- **Check**: Build logs in GitHub Actions for specific errors

### Render Deployment Fails

- **Check**: Render API key and service ID are correct
- **Check**: Environment variables are set in Render dashboard
- **Check**: Service is not paused in Render dashboard
- **Check**: Build logs in Render dashboard for specific errors

### Backend Not Building

- **Check**: `Cargo.lock` is committed to the repository
- **Check**: Rust toolchain is correctly specified
- **Check**: All required environment variables are set

### Frontend Can't Reach Backend

- **Check**: `NEXT_PUBLIC_BACKEND_URL` is set correctly in Vercel
- **Check**: Backend is running and accessible (test `/health` endpoint)
- **Check**: CORS settings in backend allow your frontend domain

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend API URL | `https://govtwool-backend.onrender.com` |
| `NEXT_PUBLIC_NETWORK` | No | Cardano network | `mainnet` or `preview` |

### Backend (Render)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BLOCKFROST_API_KEY` | Yes | Blockfrost API key | Get from [Blockfrost.io](https://blockfrost.io/) |
| `BLOCKFROST_NETWORK` | No | Cardano network | `mainnet` or `preview` |
| `KOIOS_BASE_URL` | No | Koios API endpoint | `https://preview.koios.rest/api/v1` |
| `CACHE_ENABLED` | No | Enable caching | `true` or `false` |
| `CACHE_MAX_ENTRIES` | No | Max cache entries | `10000` |
| `PORT` | Auto | Server port | Set automatically by Render |

## Next Steps

1. ✅ Set up Vercel project
2. ✅ Set up Render service
3. ✅ Configure GitHub Secrets
4. ✅ Push to `main` branch to trigger deployment
5. ✅ Verify both deployments succeed
6. ✅ Test the deployed application

## Support

If you encounter issues:

1. Check the GitHub Actions logs
2. Check Vercel deployment logs
3. Check Render deployment logs
4. Review this guide for common issues
5. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for manual deployment instructions

