# Fix for API Auth Login 404 Error

## Problem
The application was experiencing 404 errors when trying to access `/api/auth/login` endpoint. This occurred because axios was making requests without a proper base URL configuration.

## Root Cause
- In development mode, Vite's proxy configuration (in `vite.config.js`) forwards `/api/*` requests to `http://localhost:5000`
- In production builds or when the frontend runs on a different domain than the backend, axios had no baseURL configured
- Without a baseURL, axios was trying to fetch from relative URLs on the same domain, which didn't have the backend API

## Solution
Created a centralized axios configuration that:
1. Reads the `VITE_API_URL` environment variable
2. Sets it as the baseURL for all axios requests
3. Falls back to empty string for development (to use Vite's proxy)

### Changes Made

1. **Created `/client/src/config/axios.js`**
   - Configures axios with baseURL from `VITE_API_URL` environment variable
   - Exports configured axios instance

2. **Updated all component imports**
   - Changed `import axios from 'axios'` to `import axios from '../config/axios'`
   - Files updated:
     - `/client/src/context/AuthContext.jsx`
     - `/client/src/pages/Dashboard.jsx`
     - `/client/src/pages/DocumentCreate.jsx`
     - `/client/src/pages/DocumentEdit.jsx`
     - `/client/src/pages/DocumentView.jsx`
     - `/client/src/pages/ReviewQueue.jsx`
     - `/client/src/pages/ApprovalQueue.jsx`
     - `/client/src/pages/SignQueue.jsx`
     - `/client/src/pages/Archive.jsx`

## How to Use

### Development
No changes needed. The Vite proxy continues to work as before:
```bash
npm run dev
```

### Production (Netlify)
Set the `VITE_API_URL` environment variable to your backend API URL:
```
VITE_API_URL=https://your-backend-api.herokuapp.com
```

Or in Netlify dashboard:
1. Go to Site Settings > Environment Variables
2. Add `VITE_API_URL` with your backend URL

### Local Production Build
Create a `.env` file in the `/client` directory:
```
VITE_API_URL=http://localhost:5000
```

Then build:
```bash
npm run build
```

## Testing
The build was successfully tested and completed without errors.
