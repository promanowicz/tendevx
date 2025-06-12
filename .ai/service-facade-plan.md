# Service Facade Plan

## 1. Service Modules

- **AuthService**: Handles user authentication, registration, and profile management
- **CampaignService**: Manages campaign operations (CRUD) and related business logic
- **GroupService**: Handles group management operations
- **AnalyticsService**: Manages campaign conversion tracking and analytics
- **AIService**: Provides AI-powered campaign optimization suggestions

## 2. Function Definitions

### AuthService

A facade for Firebase Authentication operations with additional user profile management in Firestore.

#### Functions

```typescript
register(userData: UserRegistrationData): Promise<User>
```
- **Input**: `UserRegistrationData` (name, email, password, accessLevel)
- **Output**: `User` object with user details
- **Firebase SDK**: Uses `createUserWithEmailAndPassword()` from Firebase Auth and creates a user document in Firestore
- **Errors**: Email already in use, weak password, network errors

```typescript
login(credentials: LoginCredentials): Promise<User>
```
- **Input**: `LoginCredentials` (email, password)
- **Output**: `User` object with user details
- **Firebase SDK**: Uses `signInWithEmailAndPassword()` from Firebase Auth and fetches user document from Firestore
- **Errors**: Invalid credentials, user not found, account locked, network errors

```typescript
logout(): Promise<void>
```
- **Firebase SDK**: Uses `signOut()` from Firebase Auth
- **Errors**: Network errors

```typescript
resetPassword(email: string): Promise<void>
```
- **Input**: User email
- **Firebase SDK**: Uses `sendPasswordResetEmail()` from Firebase Auth
- **Errors**: User not found, network errors

```typescript
updateUserProfile(userId: string, profileData: UserProfileData): Promise<User>
```
- **Input**: User ID and `UserProfileData` (name, preferences)
- **Output**: Updated `User` object
- **Firebase SDK**: Updates user document in Firestore
- **Errors**: User not found, validation errors, network errors

```typescript
getCurrentUser(): Promise<User | null>
```
- **Output**: Current `User` object or null if not authenticated
- **Firebase SDK**: Uses `currentUser` from Firebase Auth and fetches user document from Firestore
- **Errors**: Network errors

### CampaignService

Manages all campaign-related operations and enforces business rules for campaign management.

#### Functions

```typescript
createCampaign(campaignData: CampaignCreateData): Promise<Campaign>
```
- **Input**: `CampaignCreateData` (title, description, groups, imageUrl, adText, affiliateLink)
- **Output**: Created `Campaign` object
- **Firebase SDK**: Creates a document in Campaigns collection in Firestore
- **Errors**: Validation errors, unauthorized access, network errors

```typescript
updateCampaign(campaignId: string, campaignData: CampaignUpdateData): Promise<Campaign>
```
- **Input**: Campaign ID and `CampaignUpdateData` (title, description, groups, imageUrl, adText, affiliateLink)
- **Output**: Updated `Campaign` object
- **Firebase SDK**: Updates document in Campaigns collection in Firestore
- **Errors**: Campaign not found, validation errors, unauthorized access, network errors

```typescript
deleteCampaign(campaignId: string): Promise<void>
```
- **Input**: Campaign ID
- **Firebase SDK**: Deletes document from Campaigns collection in Firestore
- **Errors**: Campaign not found, unauthorized access, network errors

```typescript
getCampaign(campaignId: string): Promise<Campaign>
```
- **Input**: Campaign ID
- **Output**: `Campaign` object
- **Firebase SDK**: Fetches document from Campaigns collection in Firestore
- **Errors**: Campaign not found, unauthorized access, network errors

```typescript
getUserCampaigns(filters?: CampaignFilters): Promise<Campaign[]>
```
- **Input**: Optional `CampaignFilters` (status, search term)
- **Output**: Array of `Campaign` objects
- **Firebase SDK**: Queries Campaigns collection in Firestore with filtering
- **Errors**: Unauthorized access, network errors

```typescript
publishCampaign(campaignId: string, isPublished: boolean): Promise<Campaign>
```
- **Input**: Campaign ID and publish status boolean
- **Output**: Updated `Campaign` object
- **Firebase SDK**: Updates document in Campaigns collection in Firestore
- **Errors**: Campaign not found, unauthorized access, network errors

### GroupService

Manages group operations and user group memberships.

#### Functions

```typescript
createGroup(groupData: GroupCreateData): Promise<Group>
```
- **Input**: `GroupCreateData` (name, description)
- **Output**: Created `Group` object
- **Firebase SDK**: Creates a document in Groups collection in Firestore
- **Errors**: Validation errors, unauthorized access, network errors

```typescript
updateGroup(groupId: string, groupData: GroupUpdateData): Promise<Group>
```
- **Input**: Group ID and `GroupUpdateData` (name, description)
- **Output**: Updated `Group` object
- **Firebase SDK**: Updates document in Groups collection in Firestore
- **Errors**: Group not found, validation errors, unauthorized access, network errors

```typescript
deleteGroup(groupId: string): Promise<void>
```
- **Input**: Group ID
- **Firebase SDK**: Deletes document from Groups collection in Firestore
- **Errors**: Group not found, unauthorized access, network errors

```typescript
getGroups(): Promise<Group[]>
```
- **Output**: Array of `Group` objects
- **Firebase SDK**: Fetches documents from Groups collection in Firestore
- **Errors**: Unauthorized access, network errors

```typescript
addUserToGroup(userId: string, groupId: string): Promise<void>
```
- **Input**: User ID and Group ID
- **Firebase SDK**: Updates user document in Firestore to add group to user's groups array
- **Errors**: User not found, group not found, unauthorized access, network errors

```typescript
removeUserFromGroup(userId: string, groupId: string): Promise<void>
```
- **Input**: User ID and Group ID
- **Firebase SDK**: Updates user document in Firestore to remove group from user's groups array
- **Errors**: User not found, group not found, unauthorized access, network errors

### AnalyticsService

Handles campaign analytics and conversion tracking.

#### Functions

```typescript
trackCampaignClick(campaignId: string, clickData: ClickData): Promise<void>
```
- **Input**: Campaign ID and `ClickData` (timestamp, referrer, etc.)
- **Firebase SDK**: Creates or updates analytics data in Firestore
- **Errors**: Campaign not found, validation errors, network errors

```typescript
getCampaignAnalytics(campaignId: string, timeRange?: TimeRange): Promise<CampaignAnalytics>
```
- **Input**: Campaign ID and optional time range
- **Output**: `CampaignAnalytics` object with clicks, CTR, and other metrics
- **Firebase SDK**: Queries analytics data from Firestore
- **Errors**: Campaign not found, unauthorized access, network errors

```typescript
exportAnalyticsToCSV(campaignId: string, timeRange?: TimeRange): Promise<string>
```
- **Input**: Campaign ID and optional time range
- **Output**: CSV data as string
- **Firebase SDK**: Queries analytics data from Firestore and formats as CSV
- **Errors**: Campaign not found, unauthorized access, network errors

### AIService

Provides AI-powered optimization suggestions for campaigns.

#### Functions

```typescript
generateTextSuggestions(campaignId: string): Promise<TextSuggestions>
```
- **Input**: Campaign ID
- **Output**: `TextSuggestions` object with suggested improvements
- **Firebase SDK**: Fetches campaign from Firestore, then calls OpenAI API
- **Errors**: Campaign not found, unauthorized access (non-premium users), API errors, network errors

```typescript
generateImageSuggestions(campaignId: string): Promise<ImageSuggestions>
```
- **Input**: Campaign ID
- **Output**: `ImageSuggestions` object with suggested improvements
- **Firebase SDK**: Fetches campaign from Firestore, then calls OpenAI API
- **Errors**: Campaign not found, unauthorized access (non-premium users), API errors, network errors

```typescript
applySuggestion(campaignId: string, suggestionId: string): Promise<Campaign>
```
- **Input**: Campaign ID and Suggestion ID
- **Output**: Updated `Campaign` object
- **Firebase SDK**: Updates campaign document in Firestore
- **Errors**: Campaign not found, suggestion not found, unauthorized access, network errors

## 3. Authentication and Authorization

### Authentication Mechanism

The application uses Firebase Authentication with email/password for user authentication. The AuthService facade encapsulates all authentication-related operations.

### Implementation Details

1. **Token-based Authentication**: Firebase generates and manages JWT tokens automatically.
2. **Session Management**: 
   - Tokens are stored in browser storage and automatically refreshed by Firebase SDK.
   - Sessions expire after 30 minutes of inactivity as per requirements.

### Authorization in Service Facades

1. **User Access Levels**:
   - Full access (with AI features)
   - Limited access (without AI features)

2. **Implementation**:
   - Each service method checks the current user's access level before performing operations.
   - AI services check if the user has full access before processing requests.
   - Campaign operations verify ownership or group membership before allowing access.

3. **Security Rules**:
   - Firestore security rules enforce access control at the database level.
   - Services respect these rules and provide appropriate error handling.

## 4. Validation and Business Logic

### Validation Rules

#### User Validation
- Email must be unique and in valid format
- Password must be at least 8 characters and contain numbers and special characters
- Name is required

#### Campaign Validation
- Title and description are required
- Affiliate link must be a valid URL
- Image is required
- Owner ID must match an existing user
- Groups must reference existing group IDs

#### Group Validation
- Name is required and must be unique
- Description is optional

### Business Logic Implementation

#### Campaign Publishing Logic
- When a campaign is published (`isPublished` set to true):
  - The system starts tracking conversions
  - The campaign becomes visible to all users with appropriate group access

#### Access Control Logic
- Users can only access campaigns they own or that are shared with groups they belong to
- Only users with full access can use AI optimization features
- After 5 failed login attempts, user accounts are temporarily locked

#### Analytics Logic
- Click tracking uses client IP and timestamp to identify unique clicks
- CTR calculation: (Number of clicks / Number of impressions) * 100
- Real-time analytics updates with aggregation for performance

#### AI Suggestion Logic
- Text suggestions are generated based on campaign performance and similar successful campaigns
- Image suggestions analyze the current image and recommend alternatives
- Suggestions can be applied with a single click, updating the campaign
