# Hotel Room Filter Implementation

## Overview

This document describes the filter functionality implemented for the hotel room search screen in the customer mobile app.

## Features Implemented

### 1. Filter Modal Component (`FilterModal.tsx`)

A comprehensive filter modal based on the Figma design with the following sections:

#### Sort By

- Price Lower to Higher
- Price Higher to Lower
- Highest Rated

#### Ratings

- 1 to 5-star rating filter
- Visual star icons with active state
- Single selection (tap to toggle)

#### Price Ranges

- Dual slider for min and max price
- Range: $0 - $1000
- Real-time price display
- Blue accent color matching app theme

#### Facilities

- Placeholder for future facility filters
- Designed to be extensible

### 2. Filter Integration in Home Screen

Updated `app/(tabs)/home.tsx` with:

- Filter state management
- Modal visibility controls
- API parameter mapping
- Client-side sorting logic

## API Integration

### Supported Query Parameters

Based on `GET /customer/rooms/available` endpoint:

| Parameter      | Type   | Description                 |
| -------------- | ------ | --------------------------- |
| `checkInDate`  | string | Check-in date (ISO format)  |
| `checkOutDate` | string | Check-out date (ISO format) |
| `minPrice`     | number | Minimum price per night     |
| `maxPrice`     | number | Maximum price per night     |
| `floor`        | number | Filter by floor number      |
| `minCapacity`  | number | Minimum room capacity       |
| `maxCapacity`  | number | Maximum room capacity       |
| `roomTypeId`   | string | Filter by room type         |
| `page`         | number | Pagination page             |
| `limit`        | number | Results per page            |

### Current Implementation

- ✅ Min/Max Price filtering (server-side)
- ✅ Price sorting (client-side)
- ✅ Capacity filtering (server-side - ready for UI)
- ✅ Floor filtering (server-side - ready for UI)
- ⏳ Rating filtering (pending - requires API support)
- ⏳ Facilities filtering (pending - requires API support)

## Component Structure

```
src/components/home/
├── FilterModal.tsx       # Main filter modal component
├── FilterButton.tsx      # Filter button trigger
└── index.ts             # Exports

app/(tabs)/
└── home.tsx             # Home screen with filter integration
```

## Usage

```typescript
import { FilterModal, FilterState } from "@/src/components/home/FilterModal";

// State management
const [filters, setFilters] = useState<FilterState>({
  sortBy: "price_asc",
  minPrice: 50,
  maxPrice: 500,
  facilities: [],
});

// Apply filters
const handleApplyFilters = (newFilters: FilterState) => {
  setFilters(newFilters);
};

// Render
<FilterModal
  visible={isFilterVisible}
  onClose={() => setIsFilterVisible(false)}
  onApply={handleApplyFilters}
  initialFilters={filters}
/>;
```

## Filter State Type

```typescript
export interface FilterState {
  sortBy: SortOption; // "price_asc" | "price_desc" | "rating_desc"
  rating?: number; // 1-5 star rating
  minPrice: number; // Minimum price
  maxPrice: number; // Maximum price
  facilities: string[]; // Selected facilities
  floor?: number; // Floor number
  minCapacity?: number; // Minimum capacity
  maxCapacity?: number; // Maximum capacity
}
```

## Styling

### Design Tokens Used

- **Primary Color**: `#007ef2` (Blue)
- **Text Color**: `#000` (Black)
- **Secondary Text**: `#666` (Gray)
- **Border Color**: `#d3d3d3` (Light Gray)
- **Background**: `#fff` (White)

### Typography

- **Headers**: OpenSans_700Bold
- **Body**: Roboto_400Regular
- **Medium Weight**: Roboto_500Medium
- **Bold**: Roboto_700Bold

## Dependencies

### New Package Installed

- `@react-native-community/slider` - For price range sliders

### Existing Dependencies

- `lucide-react-native` - For icons
- `@tanstack/react-query` - For data fetching

## Future Enhancements

### Short Term

1. **Facilities Filter**

   - Fetch available room tags/amenities from API
   - Display as checkboxes or chips
   - Support multi-selection

2. **Floor Filter**

   - Add floor number selector
   - Display available floors

3. **Capacity Filter**
   - Add guest capacity selector
   - Min/max capacity inputs

### Long Term

1. **Rating System**

   - Add rating data to Room model
   - Implement rating-based filtering
   - Display rating on room cards

2. **Saved Filters**

   - Allow users to save favorite filter combinations
   - Quick filter presets

3. **Advanced Filters**
   - Room view preferences
   - Bed type selection
   - Accessibility features

## Testing Checklist

- [x] Filter modal opens/closes correctly
- [x] Sort options work as expected
- [x] Price range slider updates values
- [x] Filters persist between searches
- [x] Reset button clears all filters
- [x] Apply button applies filters and closes modal
- [ ] Rating filter (when API supports it)
- [ ] Facilities filter (when implemented)
- [ ] Accessibility testing
- [ ] Performance with large datasets

## Known Limitations

1. **Rating Filter**: Not yet connected to API (API doesn't currently support room ratings)
2. **Facilities Filter**: Placeholder only - needs room tag/amenity API integration
3. **Sorting**: Currently client-side only for price sorting
4. **Capacity/Floor**: UI not yet implemented (API support ready)

## Developer Notes

- All filters are type-safe with TypeScript
- Modal follows React Native best practices
- Designed to be easily extensible
- Consistent with app's design system
- Optimized for performance with useMemo

## References

- **Figma Design**: Node ID `5-571` in Hotel Booking App design
- **API Documentation**: `docs/Roommaster API Documentation.html`
- **Instructions**: `.github/instructions/.copilot-instructions.md.instructions.md`
