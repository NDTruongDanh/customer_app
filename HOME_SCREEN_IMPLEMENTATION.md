# Home Screen Implementation

## Overview

The home screen has been redesigned based on the Figma design with a bottom tab navigation containing 3 tabs: Home, My Bookings, and Profile.

## Features Implemented

### 1. Home Screen

- **Location Header**: Displays current location (Bali, Indonesia) with a dropdown indicator and notification bell
- **Date & Guest Selector**: Allows users to select check-in/check-out dates and number of guests
- **Search Bar**: Search hotels by name with a filter button
- **Recommended Hotels Section**: Horizontal scrollable list of hotel cards showing:
  - Hotel image
  - Discount badge (if applicable)
  - Star rating
  - Hotel name
  - Location
  - Price range
  - Favorite button
- **Business Accommodates Section**: Horizontal scrollable list of business-oriented hotels with amenities

### 2. My Bookings Screen

- Empty state with a message to make first booking
- Ready for integration with booking API

### 3. Profile Screen

- User avatar and name
- Email and phone information
- Logout functionality

## Components Created

### Home Components (`src/components/home/`)

1. **SearchBar.tsx**: Reusable search input with icon
2. **FilterButton.tsx**: Blue rounded button with filter icon
3. **HotelCard.tsx**: Hotel information card with image, rating, price, etc.
4. **BusinessCard.tsx**: Business hotel card with amenities
5. **DateGuestSelector.tsx**: Date range and guest count selector

## Navigation Structure

```
app/
├── _layout.tsx (Root stack navigator)
├── index.tsx (Splash screen)
├── welcome.tsx
├── login.tsx
├── signup.tsx
└── (tabs)/
    ├── _layout.tsx (Tab navigator)
    ├── home.tsx (Home screen)
    ├── my-bookings.tsx (Bookings screen)
    └── profile.tsx (Profile screen)
```

## Design System

### Colors

- Primary Blue: `#007ef2`
- Background: `#f5fafe`
- Gray Text: `#7f7f7f`
- Dark Text: `rgba(0, 0, 0, 0.81)`
- Gold Border: `#ffd700`
- Red (Logout): `#F44336`

### Typography

- Headings: OpenSans Bold
- Body: Roboto Regular/Medium
- Accent: OpenSans Regular

## Next Steps

1. Integrate with actual hotel API endpoints
2. Implement date picker modal
3. Implement guest selector modal
4. Implement filter functionality
5. Add hotel detail screen navigation
6. Implement favorites functionality
7. Add booking creation flow
8. Fetch and display actual user bookings

## Notes

- The current implementation uses mock data
- Images are loaded from Figma assets (7-day expiry)
- Font families reference system fonts (may need custom font loading)
- All screens are responsive and scrollable
- Tab bar matches the Figma design with proper icons and spacing
