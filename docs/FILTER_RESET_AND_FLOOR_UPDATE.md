# Filter Modal - Reset Button & Floor Handling Update

## Changes Made

### ✅ **Reset Button Added**

**Location**: Header (left side)

**Layout**:

```
┌──────────────────────────┐
│ Reset    Filters     [X] │  ← Blue header
└──────────────────────────┘
```

**Functionality**:

- Resets all filters to default values
- Clears the floor input text box
- Returns to:
  - Sort: Price Low to High
  - Price: 500,000₫ - 5,000,000₫
  - Floor: Empty
  - Min Capacity: 1
  - Max Capacity: 10

**Header Structure**:

- **Left**: "Reset" button
- **Center**: "Filters" title
- **Right**: "X" close button

### 🏢 **Floor Input Behavior**

**Updated Logic**:
Floor value is treated as `undefined` (no filter) when:

- Text box is empty
- User types "0"
- Invalid input (non-numeric)

**Only filters by floor when**:

- User enters a positive number (1, 2, 3, etc.)

### 🔍 **Search Params Optimization**

**Before**:

```typescript
{
  floor: undefined,        // Sent to API
  minCapacity: undefined,  // Sent to API
  maxCapacity: undefined,  // Sent to API
}
```

**After**:

```typescript
// Only includes params with actual values
{
  // floor not included if undefined or 0
  // minCapacity not included if undefined
  // maxCapacity not included if undefined
}
```

**Benefits**:

- Cleaner API calls
- No unnecessary query parameters
- Better API performance
- Matches REST best practices

## Code Implementation

### FilterModal Changes

```typescript
// Reset function
const handleReset = () => {
  setFilters(DEFAULT_FILTERS);
  setFloorInput("");
};

// Floor validation (treats 0 as "no filter")
const handleFloorInputChange = (text: string) => {
  setFloorInput(text);
  const floorNumber = parseInt(text);

  // Treat empty, 0, or invalid as undefined
  if (text === "" || isNaN(floorNumber) || floorNumber <= 0) {
    setFilters((prev) => ({ ...prev, floor: undefined }));
  } else {
    setFilters((prev) => ({ ...prev, floor: floorNumber }));
  }
};
```

### Home Screen Changes

```typescript
const searchParams = useMemo(() => {
  if (!checkInDate || !checkOutDate) return undefined;

  const params: any = {
    page: 1,
    limit: 10,
    checkInDate: checkInDate.toISOString().split("T")[0],
    checkOutDate: checkOutDate.toISOString().split("T")[0],
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };

  // Only include optional filters if they have values
  if (filters.minCapacity) params.minCapacity = filters.minCapacity;
  if (filters.maxCapacity) params.maxCapacity = filters.maxCapacity;
  if (filters.floor && filters.floor > 0) params.floor = filters.floor;

  return params;
}, [checkInDate, checkOutDate, filters]);
```

## User Experience

### Floor Filter Examples

| User Input | Floor Value | Sent to API  |
| ---------- | ----------- | ------------ |
| (empty)    | `undefined` | ❌ Not sent  |
| "0"        | `undefined` | ❌ Not sent  |
| "1"        | `1`         | ✅ `floor=1` |
| "5"        | `5`         | ✅ `floor=5` |
| "abc"      | `undefined` | ❌ Not sent  |

### Reset Flow

1. User opens filter modal
2. Makes changes to any filters
3. Clicks "Reset" button
4. All filters return to defaults
5. Floor text box clears
6. Can now apply defaults or make new changes

## Files Modified

1. `src/components/home/FilterModal.tsx`

   - Added Reset button in header
   - Updated floor validation logic
   - Added handleReset function

2. `app/(tabs)/home.tsx`
   - Conditional search param building
   - Only includes defined values
   - Excludes floor when 0 or undefined
