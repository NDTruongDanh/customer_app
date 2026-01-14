# Error Handling Implementation

## Overview

This document describes the centralized error handling system implemented across the customer app.

## Core Components

### 1. Error Handler Utility (`src/utils/errorHandler.ts`)

A centralized utility that provides consistent error message extraction from various error types:

- **`handleApiError(error, fallbackMessage)`** - Main function that extracts user-friendly error messages

  - Handles Axios errors (API responses)
  - Detects network errors
  - Detects authentication errors (401)
  - Handles validation errors with field-level details
  - Returns an `ErrorResult` object with:
    - `message`: User-friendly error message
    - `statusCode`: HTTP status code (if applicable)
    - `isNetworkError`: Boolean flag for network issues
    - `isAuthError`: Boolean flag for authentication issues
    - `fieldErrors`: Array of field-level validation errors

- **`getErrorMessage(error, fallbackMessage)`** - Simple helper to get just the error message string
- **`isNetworkError(error)`** - Check if error is network-related
- **`isAuthError(error)`** - Check if error is authentication-related

### 2. ErrorView Component (`src/components/common/ErrorView.tsx`)

A reusable React component for displaying errors consistently across screens:

**Props:**

- `message` - Error message to display
- `onRetry` - Callback when retry button is pressed
- `isRetrying` - Whether a retry is in progress
- `isNetworkError` - Shows different icon for network errors
- `title` - Custom title (auto-generated based on error type)
- `fullScreen` - Whether to display full screen or inline
- `hideRetry` - Hide the retry button
- `retryText` - Custom retry button text

**InlineError Component:**
A smaller inline error display for form-level errors.

## Screens Updated

All screens have been updated to use the centralized error handling:

1. **`app/(tabs)/home.tsx`**

   - Uses `handleApiError` for rooms query errors
   - Displays `ErrorView` component on error

2. **`app/(tabs)/my-bookings.tsx`**

   - Uses `handleApiError` for bookings query errors
   - Displays `ErrorView` component on error

3. **`app/(tabs)/profile.tsx`**

   - Uses `handleApiError` for profile query errors
   - Uses `handleApiError` for resend verification errors
   - Displays `ErrorView` component on profile load error

4. **`app/room-details.tsx`**

   - Uses `handleApiError` for room details query errors
   - Displays `ErrorView` component on error

5. **`app/booking-summary.tsx`**

   - Uses `handleApiError` for booking creation errors

6. **`app/booking-detail.tsx`**

   - Uses `handleApiError` for booking cancellation errors

7. **`app/edit-profile.tsx`**

   - Uses `handleApiError` for profile update errors

8. **`app/login.tsx`**

   - Uses `handleApiError` for login errors

9. **`app/signup.tsx`**
   - Uses `handleApiError` for registration errors

## Usage Examples

### In TanStack Query hooks:

```tsx
const { data, error, refetch, isRefetching } = useBookings();

const errorInfo = useMemo(() => {
  if (!error) return null;
  return handleApiError(error, "Failed to load bookings.");
}, [error]);

// In render:
{
  errorInfo && (
    <ErrorView
      message={errorInfo.message}
      isNetworkError={errorInfo.isNetworkError}
      onRetry={refetch}
      isRetrying={isRefetching}
    />
  );
}
```

### In mutation callbacks:

```tsx
mutation.mutate(data, {
  onError: (error: unknown) => {
    const errorInfo = handleApiError(error, "Operation failed.");
    showAlert("Error", errorInfo.message);
  },
});
```

## Benefits

1. **Consistent UX**: All errors are displayed with the same visual style
2. **Network Detection**: Automatically detects and shows appropriate UI for network errors
3. **User-Friendly Messages**: Extracts the most relevant error message from API responses
4. **Type Safety**: Uses TypeScript `unknown` type instead of `any` for errors
5. **Retry Functionality**: Built-in retry button with loading state
6. **Maintainability**: Single source of truth for error handling logic
