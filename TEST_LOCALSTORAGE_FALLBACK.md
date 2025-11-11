# localStorage Documents Fallback - Testing Guide

## Overview
The application now automatically uses localStorage as a fallback when the backend API is not available. This enables full functionality even without a running backend server.

## How It Works

1. **Automatic Detection**: When any API request fails (404, 500, or network error), the axios interceptor automatically catches it
2. **localStorage Fallback**: The failed request is rerouted to use mock documents stored in localStorage
3. **Visual Indicator**: An orange banner appears at the top saying "📦 OFFLINE MODE - Using localStorage for Documents"
4. **Persistent Data**: All changes are saved to localStorage and persist across page refreshes

## Features Supported

- ✅ View all documents (Dashboard)
- ✅ Filter documents by status
- ✅ Create new documents
- ✅ Edit draft/revision documents
- ✅ Submit documents for review
- ✅ Review documents (approve, reject, request changes)
- ✅ Approve documents
- ✅ Sign documents
- ✅ Add comments to documents
- ✅ Upload attachments (stores file metadata)
- ✅ View archived documents
- ✅ Search and filter in archive

## Testing Instructions

### Option 1: Test Without Backend (Recommended for Quick Testing)

1. Start only the frontend:
   ```bash
   cd client
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Click "Development Mode (Bypass Login)" on the login page

4. Select any role (e.g., "admin")

5. You should see TWO banners:
   - Yellow banner: "⚠️ DEVELOPMENT MODE - Bypass Authentication Active"
   - Orange banner: "📦 OFFLINE MODE - Using localStorage for Documents"

6. Navigate through the app:
   - Dashboard: See 5 sample documents
   - Review Queue: See documents in review status
   - Approval Queue: See documents waiting for approval
   - Sign Queue: See documents ready to sign
   - Archive: See completed documents

7. Try operations:
   - Create a new document
   - Submit a document for review
   - Review/approve/sign documents
   - Add comments

### Option 2: Test With Backend That Gets Stopped

1. Start both frontend and backend:
   ```bash
   npm run dev
   ```

2. Login normally with real credentials

3. Stop the backend server (Ctrl+C in the terminal running the backend)

4. Try to navigate or refresh - you'll see the orange fallback banner appear

5. All document operations will now work with localStorage

## Mock Data

The fallback automatically generates 5 sample documents:

1. **DOC-2024-001**: Proposal Pengadaan Barang (Status: draft)
2. **DOC-2024-002**: Laporan Keuangan Q1 (Status: review1)
3. **DOC-2024-003**: Kontrak Vendor IT (Status: approve)
4. **DOC-2024-004**: Surat Keputusan Direksi (Status: sign)
5. **DOC-2024-005**: Memo Internal (Status: archived)

## localStorage Keys

The following keys are used in localStorage:

- `mockDocuments`: Array of document objects
- `mockComments`: Array of comment objects
- `mockAttachments`: Array of attachment metadata
- `bypassUser`: Mock user object (from bypass login feature)

## Clearing Test Data

To reset all test data:

```javascript
// Open browser console and run:
localStorage.clear();
// Then refresh the page
```

## Implementation Details

### Files Modified/Created:

1. **client/src/services/localStorageDocuments.js** (NEW)
   - Service layer for all localStorage operations
   - CRUD operations for documents, comments, attachments
   - Mock data generation

2. **client/src/config/axios.js** (MODIFIED)
   - Added response interceptor to catch failed requests
   - Routes failed requests to localStorage service
   - Logs fallback mode activation to console

3. **client/src/context/FallbackContext.jsx** (NEW)
   - Context to track fallback mode status
   - Monitors localStorage and axios responses

4. **client/src/components/Layout.jsx** (MODIFIED)
   - Added orange banner for fallback mode
   - Uses FallbackContext to display status

5. **client/src/main.jsx** (MODIFIED)
   - Wrapped App with FallbackProvider

## Benefits

1. **Development**: Work on frontend without backend running
2. **Demos**: Show full workflow without server setup
3. **Testing**: Test UI logic independently
4. **Resilience**: Graceful degradation if backend is down
5. **Offline**: Continue working during network issues

## Limitations

- File attachments use object URLs (not actual file storage)
- No real authentication when using bypass login
- Data only persists in browser localStorage (not shared)
- No real-time updates from other users
- Network-dependent features (email notifications) won't work

## Console Messages

When fallback activates, you'll see:
```
📦 localStorage fallback mode enabled - Using mock documents
```

All successful localStorage operations will have status text:
- "OK (localStorage)"
- "Created (localStorage)"
