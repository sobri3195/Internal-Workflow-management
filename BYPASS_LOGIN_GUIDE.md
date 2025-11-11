# Login Bypass Feature - Development Mode

## Overview
This feature allows developers to bypass the authentication system during development and testing when the backend server is not available or when you want to quickly test different user roles.

## How to Use

### Method 1: Via Login Page UI
1. Navigate to the login page (`/login`)
2. Click on "Development Mode (Bypass Login)" link at the bottom
3. Select the role you want to test with from the dropdown:
   - Admin - Full access to all features
   - Submitter - Can create and submit documents
   - Reviewer1/2/3 - Can review documents at different stages
   - Approver - Can approve documents
   - Signer - Can sign documents
4. Click "Bypass Login sebagai [Role]"
5. You will be logged in immediately with a mock user

### Method 2: Programmatic Bypass
You can also use the bypass login function programmatically in your code:

```javascript
import { useAuth } from '../context/AuthContext';

function YourComponent() {
  const { bypassLogin } = useAuth();
  
  const handleQuickLogin = () => {
    bypassLogin('admin'); // or any role: 'submitter', 'reviewer1', etc.
  };
  
  return <button onClick={handleQuickLogin}>Quick Login</button>;
}
```

## Features

### Mock User Data
When you bypass login, a mock user is created with:
- **ID**: 1
- **Username**: dev_user
- **Email**: dev@example.com
- **Full Name**: Development User
- **Role**: Selected role (admin, submitter, etc.)
- **Unit Kerja**: Development
- **Status**: Active

### Visual Indicators
- Yellow warning banner at the top of the page when in bypass mode
- Warning message on the login page explaining it's for development only
- Toast notification confirming bypass login success

### Data Persistence
- Bypass login state is stored in localStorage
- Persists across page refreshes
- Can be cleared by clicking logout

## Important Notes

⚠️ **WARNING**: This feature is for **DEVELOPMENT AND TESTING ONLY**

- This bypass completely skips backend authentication
- No actual API calls are made to authenticate
- Should NEVER be used in production
- The backend API calls will still fail if the backend is not running (you'll get 404 errors for data endpoints)

## When to Use

✅ **Good use cases:**
- Testing UI for different user roles
- Frontend development when backend is not available
- Quick testing of role-based navigation and permissions
- Demonstrating features without setting up full backend

❌ **Don't use for:**
- Production environments
- When you need actual data from the backend
- Security testing
- Performance testing

## Troubleshooting

### Still Getting 404 Errors?
If you're getting 404 errors after bypassing login:
- These are likely from API calls to fetch actual data
- The bypass only skips authentication, not the backend API
- You'll need to either:
  - Start the backend server (`npm run server`)
  - Mock the API responses in your code
  - Add additional bypass logic for data fetching

### Need to Test with Real Data?
If you need real data:
1. Set up the backend server
2. Create a `.env` file (copy from `.env.example`)
3. Set up the database
4. Use normal login with demo credentials

## Implementation Details

The bypass feature modifies:
- `client/src/context/AuthContext.jsx` - Adds `bypassLogin` function and `bypassMode` state
- `client/src/pages/Login.jsx` - Adds UI for bypass mode with role selection
- `client/src/components/Layout.jsx` - Shows warning banner when in bypass mode

The mock user is stored in localStorage under the key `bypassUser` and is checked on app initialization.
