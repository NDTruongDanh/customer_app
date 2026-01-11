# Filter Modal Updates

## Changes Made

### Removed Features

- ✅ **Ratings Filter**: Completely removed as requested
- ✅ **Facilities Section**: Removed from UI

### Updated Features

- ✅ **Price Range**: Now uses a proper dual-handle range slider
  - Library: `@ptomasroos/react-native-multi-slider`
  - Single slider with two handles for min and max
  - Range: $0 - $1000
  - Step: $10 increments
  - Visual feedback with blue selected track

### New Features Added

- ✅ **Floor Filter**:

  - Increment/decrement controls with +/- buttons
  - Shows "Any" when not set
  - Minimum value: 0

- ✅ **Guest Capacity Filters**:
  - **Minimum Capacity**: Separate counter with +/- controls
  - **Maximum Capacity**: Separate counter with +/- controls
  - Both show "Any" when not set
  - Minimum value: 0

## Updated FilterState Interface

```typescript
export interface FilterState {
  sortBy: SortOption; // "price_asc" | "price_desc" | "rating_desc"
  minPrice: number; // Minimum price
  maxPrice: number; // Maximum price
  floor?: number; // Floor number (optional)
  minCapacity?: number; // Minimum guest capacity (optional)
  maxCapacity?: number; // Maximum guest capacity (optional)
}
```

## Dependencies

### Replaced Package

- ❌ Removed: `@react-native-community/slider` (single slider)
- ✅ Added: `@ptomasroos/react-native-multi-slider` (range slider)

### Installation Command

```bash
pnpm remove @react-native-community/slider
pnpm add @ptomasroos/react-native-multi-slider
```

## UI Components

### Price Range Slider

- Uses `MultiSlider` component with two handles
- Blue selection bar between handles (#007ef2)
- Gray unselected tracks (#d3d3d3)
- Custom styled markers (24x24 circles)
- Real-time value display: "$50 - $500"

### Counter Controls (Floor & Capacity)

- Circular +/- buttons with blue borders
- 44x44 touch targets for accessibility
- Centered value display
- Shows "Any" when value is undefined
- Prevents negative values

## Visual Design

### Layout Structure

```
Sort By
└─ Dropdown with chevron

Price Range
└─ Dual-handle slider
└─ Price display text

Floor
└─ [ - ] [ Value ] [ + ]

Guest Capacity
├─ Minimum: [ - ] [ Value ] [ + ]
└─ Maximum: [ - ] [ Value ] [ + ]
```

### Styling Consistency

- **Primary Color**: #007ef2 (blue)
- **Border Color**: #d3d3d3 (light gray)
- **Text Color**: #333 (dark gray)
- **Section Spacing**: 28px between sections
- **Border Radius**: 10px for buttons and dropdowns

## API Integration

All filter values are properly mapped to API parameters:

- `minPrice` → `minPrice` query param
- `maxPrice` → `maxPrice` query param
- `floor` → `floor` query param
- `minCapacity` → `minCapacity` query param
- `maxCapacity` → `maxCapacity` query param

## User Experience

### Reset Behavior

- Clicking "Reset" clears all filters to defaults:
  - Sort: Price Lower to Higher
  - Price Range: $50 - $500
  - Floor: undefined (Any)
  - Min Capacity: undefined (Any)
  - Max Capacity: undefined (Any)

### Apply Behavior

- Clicking "APPLY" saves all filter values
- Closes the modal
- Triggers API call with updated parameters
- Results are sorted/filtered accordingly
