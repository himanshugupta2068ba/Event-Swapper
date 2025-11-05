# Deployment Guide for Render

This guide will help you deploy SlotSwapper on Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A MongoDB database (use MongoDB Atlas or Render's MongoDB service)
3. Your code pushed to GitHub, GitLab, or Bitbucket

## Step 1: Prepare MongoDB

1. **Option A: Use MongoDB Atlas (Recommended)**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/slotswapper`)
   - Make sure to whitelist all IPs (0.0.0.0/0) for Render

   **Option B: Use Render MongoDB**
   - In Render dashboard, create a new "MongoDB" service
   - Copy the internal connection string

## Step 2: Deploy on Render

### Method 1: Using render.yaml (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect the `render.yaml` file
5. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A random secret string (e.g., generate using `openssl rand -base64 32`)
6. Click "Apply" and wait for deployment

### Method 2: Manual Deployment

1. **Create Web Service**
   - In Render dashboard, click "New +" → "Web Service"
   - Connect your repository

2. **Configure the Service**
   - **Name**: `slotswapper` (or any name you prefer)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (root)
   - **Build Command**: 
     ```bash
     cd backend && npm install && npm run build
     ```
   - **Start Command**: 
     ```bash
     cd backend && npm start
     ```

3. **Add Environment Variables**
   Click on "Advanced" and add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render automatically sets PORT, but we set a fallback)
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET` = A random secret string (keep this secret!)

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Wait for the build to complete (first build takes ~5-10 minutes)

## Step 3: Verify Deployment

1. Once deployed, Render will provide a URL like: `https://slotswapper.onrender.com`
2. Visit the URL and test the application:
   - Sign up a new user
   - Create events
   - Test swap functionality

## Important Notes

### React Router & Static Files

The backend is configured to serve the React build files and handle routing. When a user visits any route (like `/dashboard`), the server will:
1. Check if it's an API route (`/api/*`) → handle API request
2. Otherwise → serve `index.html` and let React Router handle the routing

This is already configured in `backend/server.js`.

### Environment Variables in Frontend

If you need different API URLs for different environments, you can:
1. Set `REACT_APP_API_URL` in Render environment variables
2. Or use the default behavior (uses relative paths `/api` in production)

### Free Tier Limitations

- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for always-on service

### Troubleshooting

**Build fails:**
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Render defaults to latest LTS)

**App doesn't work:**
- Check MongoDB connection string is correct
- Verify all environment variables are set
- Check server logs in Render dashboard

**404 errors on routes:**
- This is already handled by the server.js configuration
- Ensure you built the frontend (`npm run build`)

**API calls fail:**
- Check CORS settings (already configured for all origins in production)
- Verify API URLs are using relative paths in production

## Updating Your App

Simply push changes to your repository, and Render will automatically rebuild and redeploy.

## Alternative: Separate Frontend & Backend

If you prefer to deploy frontend and backend separately:

1. **Backend Service:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Remove the static file serving code from `server.js`

2. **Frontend Static Site:**
   - Create a "Static Site" service
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Set `REACT_APP_API_URL` to your backend URL

But the single-service deployment (as configured) is simpler and works well!
