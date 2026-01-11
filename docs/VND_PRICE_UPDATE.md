# Vietnamese Dong (VND) Price Filter Update

## Changes Made

### Price Range Configuration

**Previous (USD):**

- Min: $50
- Max: $500
- Range: $0 - $1,000
- Step: $10

**Updated (VND):**

- Min: 500,000₫
- Max: 5,000,000₫
- Range: 0₫ - 10,000,000₫
- Step: 100,000₫

### Display Format

**Currency Symbol:** ₫ (Vietnamese Dong symbol)

**Number Formatting:**

- Uses `toLocaleString('vi-VN')` for proper thousand separators
- Example: `1,500,000₫` instead of `1500000₫`

### Example Price Displays

| Amount  | Formatted Display |
| ------- | ----------------- |
| 500000  | 500,000₫          |
| 1500000 | 1,500,000₫        |
| 5000000 | 5,000,000₫        |

### Code Implementation

```typescript
// Format function
const formatVND = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

// Default values
const DEFAULT_FILTERS: FilterState = {
  sortBy: "price_asc",
  minPrice: 500000,    // 500,000 VND
  maxPrice: 5000000,   // 5,000,000 VND
};

// Slider configuration
<MultiSlider
  values={[filters.minPrice, filters.maxPrice]}
  min={0}
  max={10000000}    // 10 million VND
  step={100000}      // 100k VND increments
  ...
/>

// Display
<Text>
  {formatVND(filters.minPrice)}₫ - {formatVND(filters.maxPrice)}₫
</Text>
```

### Typical VND Hotel Room Prices

For reference, typical hotel room prices in Vietnam:

- Budget: 200,000₫ - 500,000₫/night
- Mid-range: 500,000₫ - 2,000,000₫/night
- Upscale: 2,000,000₫ - 5,000,000₫/night
- Luxury: 5,000,000₫+/night

The filter now supports a range from 0₫ to 10,000,000₫ to cover all hotel categories.

## Files Updated

1. `src/components/home/FilterModal.tsx`

   - Added `formatVND()` helper function
   - Updated slider min/max/step values
   - Changed display format to use ₫ symbol
   - Updated DEFAULT_FILTERS

2. `app/(tabs)/home.tsx`
   - Updated default filter state to use VND values

## User Experience

Users will now see prices displayed as:

- **500,000₫ - 5,000,000₫** (with proper formatting)
- Slider adjusts in 100,000₫ increments
- Numbers are formatted with Vietnamese locale thousand separators
