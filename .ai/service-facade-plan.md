# Service Architecture

## Implemented Services

### UserService (`src/services/user.service.ts`)
- `register(email, password, data)` — creates Firebase Auth account + Firestore profile
- `signIn(email, password)` — authenticates and returns user profile
- `signOut()`
- `getUserProfile(userId)`
- `updateUserProfile(userId, data)`
- `sendPasswordReset(email)`

### CampaignService (`src/services/campaign.service.ts`)
- `createCampaign(data, userId)` — validates, checks target overlap, writes to Firestore
- `getCampaign(uuid)`
- `updateCampaign(uuid, data, userId)` — re-checks overlap when dates or targets change
- `getUserCampaigns(userId)`
- `deleteCampaign(uuid, userId)` — soft delete only
- Private: `datesOverlap(aStart, aEnd, bStart, bEnd)` — pure overlap check
- Private: `assertNoTargetOverlap(targets, startDate, endDate, excludeUuid?)` — throws if any (appId, trainingId) pair overlaps an existing campaign's date range

### OpenRouterService (`src/services/openrouter-service.ts`)
- `provideSuggestion(campaign)` — generates AI optimization text
- `getSupportedModels()`
- Wraps OpenAI-compatible API (OpenRouter); retries on network errors, handles 401/429

## Planned Services

### AnalyticsService
- `getCampaignAnalytics(campaignId, timeRange?)` — aggregates events subcollection
- `exportAnalyticsToCSV(campaignId, timeRange?)`
- Analytics events written by client apps directly to `campaigns/{id}/events/{eventId}`

### GroupService
- Reserved for future access control implementation

## State Management

### authStore (`src/stores/auth.ts`)
- Wraps UserService, exposes: `isAuthenticated`, `userId`, `userEmail`, `userProfile`
- Actions: `initialize`, `login`, `register`, `logout`, `resetPassword`, `updateProfile`

## Composables

### useCampaign (`src/composables/useCampaign.ts`)
- Wraps CampaignService, injects `ownerId` from authStore
- Exposes: `campaigns`, `currentCampaign`, `isLoading`, `error`
- Actions: `fetchUserCampaigns`, `getCampaign`, `createCampaign`, `updateCampaign`, `deleteCampaign`

## Types (`src/services/types.ts`)
- `CreateCampaignData` — Campaign minus uuid, timestamps, ownerId, analytics fields
- `UpdateCampaignData` — Partial of CreateCampaignData minus ownerId
- `FirebaseError` — wraps Firebase errors with code and original error
