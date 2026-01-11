---
trigger: always_on
---

# Room Master — Mobile App (Condensed Agent Instructions)

## Purpose

Frontend-only Expo (React Native + TypeScript) app that consumes an existing backend to let customers browse and book hotel rooms.

**API base:** `https://room-master-dcdsfng4c7h7hwbg.eastasia-01.azurewebsites.net/v1`  
All customer endpoints are under `/customer`.

## Tech Stack

- Expo (React Native) + TypeScript
- Navigation: React Navigation v6+
- State: React Context API or Zustand
- HTTP: axios (or fetch)
- Forms: react-hook-form
- Styling: RN StyleSheet or NativeWind (Tailwind for RN)
- Secure storage: expo-secure-store
- Date: date-fns, react-native-calendars

Recommended minimal deps: `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`, `axios`, `react-hook-form`, `expo-secure-store`, `date-fns`, `react-native-calendars`.

## High-level Project Structure

```
src/
 ├─ api/            # client.ts, endpoints.ts, services/*.ts
 ├─ components/     # common, rooms, bookings...
 ├─ screens/        # auth, home, rooms, booking, profile
 ├─ navigation/     # AppNavigator, AuthNavigator, MainNavigator
 ├─ context/        # AuthContext, BookingContext
 ├─ hooks/          # useAuth, useRooms, useBookings
 ├─ types/          # auth.types.ts, room.types.ts, booking.types.ts
 ├─ utils/          # storage, validation, dateHelpers, errorHandler
 └─ constants/      # colors.ts, config.ts (API URL)
App.tsx, assets/, app.json
```

## Core Features

1. **Auth**
   - Register / Login / Logout / Forgot & Reset password
   - Store `accessToken` and `refreshToken` in SecureStore
   - Auto-login on app start and token refresh flow
2. **Rooms**
   - List with search & filters: date range, price range, room type, tags
   - Detail screen with images, amenities, price, availability
3. **Booking Flow**
   - Date picker, guest count, promo code input
   - Price breakdown, booking confirmation, success screen
4. **Profile & Bookings**
   - Edit profile, change password
   - Booking history (filter by status), booking details, cancel booking
5. **Promotions**
   - Browse, claim, apply promotion to booking

## API Endpoints (essential)

**Auth**

- `POST /customer/auth/register`
- `POST /customer/auth/login`
- `POST /customer/auth/logout`
- `POST /customer/auth/refresh-tokens`
- `POST /customer/auth/forgot-password`
- `POST /customer/auth/reset-password`

**Rooms**

- `GET /customer/rooms/available` (query params for search/filter)
- `GET /customer/rooms/{roomId}`

**Bookings**

- `POST /customer/bookings`
- `GET /customer/bookings`
- `GET /customer/bookings/{id}`
- `POST /customer/bookings/{id}/cancel`

**Profile**

- `GET /customer/profile`
- `PATCH /customer/profile`
- `POST /customer/profile/change-password`

**Promotions**

- `GET /customer/promotions/available`
- `GET /customer/promotions/my-promotions` (auth)
- `POST /customer/promotions/claim` (auth)

## API Client (pattern)

Create an axios instance with:

- `baseURL = API_BASE_URL`
- Request interceptor: attach `Authorization: Bearer <accessToken>` from SecureStore
- Response interceptor: on 401 attempt refresh via `refresh-tokens` or clear auth and redirect to login

Pseudocode:

```ts
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (cfg) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      // try refresh: call /customer/auth/refresh-tokens with refresh token
      // if success: update tokens in SecureStore and retry original request
      // else: clear tokens and navigate to Login
    }
    return Promise.reject(err);
  }
);
```

## Services (pattern)

Each service uses `api` and returns `response.data`. Example services: `authService`, `roomService`, `bookingService`, `profileService`, `promotionService`. Keep logic minimal in services — validations and UI handling in UI layer.

## Key Type Interfaces (summary)

- `User { id, email, name, phone?, role:'customer' }`
- `AuthTokens { access:{token,expires}, refresh:{token,expires} }`
- `Room { id, roomNumber, floor, roomType, tags[], status, images?, description?, currentPrice? }`
- `Booking { id, room, customer, checkInDate, checkOutDate, numberOfGuests, totalPrice, status }`
- `Promotion { id, code, discountType, discountValue, startDate, endDate, isActive }`

## UI / UX Guidelines

- Clean, modern, image-forward layout; bottom tab navigation for main areas
- Loading states for all async ops; friendly error messages via a central `handleApiError`
- Room list: grid/list toggle, filters modal, FlatList for performance
- Room detail: image carousel, sticky "Book Now" CTA
- Booking: clear summary, price breakdown, T&C checkbox before confirm
- Colors: primary blue, secondary purple, readable typographic hierarchy

## State Management Patterns

- AuthContext: provide `user`, `isLoading`, `login`, `logout`, `register`, `checkAuth`.
- On start: read tokens, attempt profile fetch; if 401 try refresh flow.
- For lists, prefer local state + caching; use React Query (optional) or manual caching/pagination.

## Error handling

Central handler returns a user-friendly message:

- If `error.response` → use server message
- If `error.request` → "Network error"
- Else → "An unexpected error occurred"

## Testing / QA Focus

- Auth flows & token refresh
- Room search/filter correctness
- Booking creation (validations & edge dates)
- Date picker edge cases and timezones (ISO 8601)
- Offline behavior & network errors
- Pagination for bookings/rooms

## Security & Performance

- Store tokens only in SecureStore
- Use HTTPS; validate input client-side
- Use FlatList / memoization for lists
- Optimize images and paginate large results

## Env & Config

`.env`:

```
EXPO_PUBLIC_API_URL=https://room-master-dcdsfng4c7h7hwbg.eastasia-01.azurewebsites.net/v1
```

`constants/config.ts` should export this for `api` baseURL.

## Scripts / Getting Started

```bash
npx create-expo-app room-master-app --template blank-typescript
cd room-master-app
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs axios react-hook-form expo-secure-store date-fns react-native-calendars
npm run ios|android|web
```

## Implementation Notes / Best Practices

- Prefer strict TypeScript; avoid `any`.
- Use `React.memo` for row items; use `FlatList` for long lists.
- Keep services thin; move UI logic into screens/hooks.
- Always test with the real backend endpoints listed above.
- Booking status lifecycle: `pending` → `confirmed` → `checked_in` → `checked_out` (or `cancelled`).
- Date format: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).

## Success Criteria (app should)

- Browse & filter available rooms
- Complete booking flow (select → confirm → success)
- Persist auth across app restarts and refresh tokens automatically
- Show booking history with cancellation
- Work smoothly on iOS & Android; handle network errors gracefully

**Last updated:** Jan 2026 — Target iOS 14+, Android 11+, Expo SDK 51.x.
