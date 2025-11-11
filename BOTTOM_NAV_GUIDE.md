# Bottom Navigation Guide

## Overview

The bottom navigation is a mobile-friendly navigation bar that appears at the bottom of the screen on mobile devices (screens smaller than 768px). It provides quick access to the main features of the application.

## Features

### 🎯 Key Features
- **Mobile-Only Display**: Only visible on screens < 768px (Tailwind's `md` breakpoint)
- **Fixed Position**: Always visible at the bottom, scrolls with content
- **Role-Based**: Shows only menu items relevant to the user's role
- **Active State**: Current page highlighted with blue color and solid icons
- **Responsive Icons**: Uses Heroicons with outline and solid variants

## Navigation Items

### All Users
1. **🏠 Home** (`/`)
   - Dashboard overview
   - Always visible to all users

2. **📦 Archive** (`/archive`)
   - Document archive
   - Always visible to all users

### Role-Based Items

3. **📋 Review** (`/review`)
   - Review queue
   - Visible to: `reviewer1`, `reviewer2`, `reviewer3`, `admin`

4. **✅ Approve** (`/approve`)
   - Approval queue
   - Visible to: `approver`, `admin`

5. **✍️ Sign** (`/sign`)
   - Signature queue
   - Visible to: `signer`, `admin`

## Visual Layout

```
┌─────────────────────────────────────────┐
│                                         │
│         Application Content             │
│                                         │
│                                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  🏠    📋    ✅    ✍️    📦            │
│ Home Review Approve Sign Archive        │
└─────────────────────────────────────────┘
```

### Active State Example

When on Home page:
```
┌─────────────────────────────────────────┐
│  🏠    📋    ✅    ✍️    📦            │
│ Home Review Approve Sign Archive        │
│  ↑ (Blue color, solid icon)             │
└─────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥ 768px)
```
Top Navigation Bar:
┌──────────────────────────────────────────┐
│ Workflow | Home | Review | Approve | ... │
└──────────────────────────────────────────┘

Content with full height
No bottom navigation
```

### Mobile (< 768px)
```
Top Navigation Bar (simplified):
┌─────────────────────────┐
│ Workflow Management  🚪 │
└─────────────────────────┘

Content with bottom padding (16px)

Bottom Navigation:
┌─────────────────────────┐
│  🏠  📋  ✅  ✍️  📦   │
└─────────────────────────┘
```

## Implementation Details

### Component: `BottomNav.jsx`

**Location**: `client/src/components/BottomNav.jsx`

**Props**:
- `user` (object): Current user object with role information

**Key CSS Classes**:
- `fixed bottom-0`: Fixed at bottom
- `md:hidden`: Hidden on medium screens and up
- `z-50`: High z-index to stay on top
- `border-t`: Top border for visual separation

### Layout Updates

**Component**: `Layout.jsx`

**Changes**:
1. Added `pb-16 md:pb-0` to main container for bottom padding on mobile
2. Imported and rendered `<BottomNav user={user} />`
3. Made logout button more mobile-friendly (icon only on mobile)
4. Hidden user info on mobile screens

## Styling

### Colors
- **Active**: `text-blue-600` (Tailwind blue)
- **Inactive**: `text-gray-600` (Tailwind gray)
- **Hover**: `hover:text-gray-900`
- **Background**: `bg-white`
- **Border**: `border-gray-200`

### Icons
- **Size**: `h-6 w-6` (24px)
- **Outline**: Default state
- **Solid**: Active state

### Text
- **Size**: `text-xs` (12px)
- **Spacing**: `mt-1` (4px margin top)

## Testing

### Test on Mobile
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Select mobile device or resize to < 768px
4. Bottom navigation should appear

### Test Role-Based Navigation
1. Login as different users:
   - **Admin**: Should see all 5 items
   - **Submitter**: Should see Home and Archive only (2 items)
   - **Reviewer**: Should see Home, Review, and Archive (3 items)
   - **Approver**: Should see Home, Approve, and Archive (3 items)
   - **Signer**: Should see Home, Sign, and Archive (3 items)

### Test Active State
1. Navigate to different pages
2. Bottom nav icon should:
   - Turn blue
   - Show solid variant
   - Text should turn blue

## Accessibility

- ✅ Semantic HTML (`<nav>`, `<Link>`)
- ✅ Descriptive text labels
- ✅ Color contrast meets WCAG standards
- ✅ Touch-friendly target sizes (h-16 = 64px height)
- ✅ Keyboard accessible (via React Router Links)

## Browser Support

- ✅ Chrome Mobile
- ✅ iOS Safari
- ✅ Firefox Mobile
- ✅ Samsung Internet
- ✅ All modern mobile browsers

## Future Enhancements

Potential improvements:
- [ ] Add badges for pending items (e.g., "3" on Review queue)
- [ ] Add haptic feedback on tap
- [ ] Add subtle animations on tab switch
- [ ] Add swipe gestures
- [ ] Add dark mode support

## Troubleshooting

### Bottom nav not showing
- Check screen width is < 768px
- Check z-index conflicts
- Verify component is rendered in Layout

### Wrong items showing
- Check user role
- Verify role names match exactly
- Check filtering logic in BottomNav component

### Active state not working
- Check pathname matching
- Verify solid icons are imported
- Check color classes are applied
