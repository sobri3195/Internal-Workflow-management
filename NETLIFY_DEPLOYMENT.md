# Netlify Deployment Guide

This guide will help you deploy the Workflow Management System frontend to Netlify.

## Prerequisites

- A Netlify account (free tier works)
- Git repository hosted on GitHub, GitLab, or Bitbucket
- Backend API deployed separately (see DEPLOYMENT_GUIDE.md for backend deployment options)

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com/
   - Click "Add new site" > "Import an existing project"
   - Choose your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository

3. **Configure build settings**
   - Base directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `client/dist`
   - Click "Show advanced" and add environment variables:
     - `NODE_VERSION`: `18`
     - `VITE_API_URL`: Your backend API URL (e.g., `https://your-api.herokuapp.com`)

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your app
   - Your site will be live at a Netlify subdomain (e.g., `random-name-123.netlify.app`)

5. **Custom Domain (Optional)**
   - Go to "Domain settings" in your Netlify dashboard
   - Add your custom domain
   - Follow Netlify's instructions to configure DNS

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify site**
   ```bash
   netlify init
   ```
   - Follow the prompts to create a new site or link to existing site
   - The build settings are already configured in `netlify.toml`

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Environment Variables

Since this app requires a backend API, you need to configure the API URL:

1. Go to your Netlify site dashboard
2. Navigate to "Site settings" > "Environment variables"
3. Add the following:
   - `VITE_API_URL`: The URL of your deployed backend API

## Backend Deployment Options

The frontend needs a backend API. Here are some options:

1. **Heroku** (Easiest for Node.js apps)
   - See DEPLOYMENT_GUIDE.md for Heroku instructions
   - Free tier available

2. **Railway** (Modern alternative to Heroku)
   - Visit https://railway.app/
   - Connect your GitHub repo
   - Deploy with one click

3. **Render** (Another Heroku alternative)
   - Visit https://render.com/
   - Create a new Web Service
   - Connect your repo and deploy

4. **DigitalOcean App Platform**
   - See DEPLOYMENT_GUIDE.md for instructions

5. **AWS/GCP/Azure** (For production)
   - See DEPLOYMENT_GUIDE.md for cloud platform instructions

## Features Included

✅ **Bottom Navigation**
- Mobile-friendly bottom navigation bar
- Shows on mobile devices (< 768px)
- Hides on desktop (navigation remains in top bar)
- Active state indication with solid icons
- Role-based visibility (only shows relevant options)

✅ **Responsive Design**
- Top navigation for desktop
- Bottom navigation for mobile
- Optimized layout spacing
- Mobile-optimized logout button

✅ **SPA Routing**
- Proper redirect rules for React Router
- All routes handled by index.html

## Testing Your Deployment

1. **Access your site**
   - Visit your Netlify URL (e.g., `https://your-app.netlify.app`)

2. **Test API connection**
   - Try to login
   - If you see connection errors, check:
     - Backend API is running
     - VITE_API_URL is set correctly
     - Backend CORS allows your Netlify domain

3. **Test mobile navigation**
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Switch to mobile view
   - You should see bottom navigation appear

## Troubleshooting

### Build Fails

- Check build logs in Netlify dashboard
- Verify all dependencies are in package.json
- Make sure Node version is 18 or higher

### API Connection Issues

- Verify VITE_API_URL environment variable is set
- Check backend CORS configuration allows Netlify domain
- Test backend API directly with curl or Postman

### 404 Errors on Page Refresh

- This should be handled by the redirect rules in netlify.toml
- If still happening, verify netlify.toml is in the root directory

### Bottom Navigation Not Showing

- Bottom nav only shows on screens < 768px wide
- Use browser DevTools to test mobile view
- Clear cache and hard refresh (Ctrl+Shift+R)

## Continuous Deployment

Once connected to Git:

1. Every push to your main branch automatically deploys
2. Pull requests create deploy previews
3. View deploy logs in Netlify dashboard
4. Rollback to previous deployments if needed

## Cost

- Netlify free tier includes:
  - 100GB bandwidth/month
  - Unlimited sites
  - Deploy previews
  - HTTPS

This is more than enough for most internal applications.

## Next Steps

- Set up custom domain
- Configure email notifications
- Enable Netlify Analytics (optional)
- Set up deploy notifications in Slack/Discord
