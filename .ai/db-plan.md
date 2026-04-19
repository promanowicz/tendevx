# Database Schema — Firestore

## Collections

### users
| Field | Type | Notes |
|---|---|---|
| id | string | Firebase Auth UID |
| name | string | |
| email | string | |
| groups | string[] | reserved for future use |

### campaigns
| Field | Type | Notes |
|---|---|---|
| uuid | string | Firestore document ID |
| ownerId | string | Firebase Auth UID |
| name | string | internal label (manager only) |
| description | string | internal notes (manager only) |
| createdAt | Timestamp | |
| updatedAt | Timestamp | |
| isDeleted | boolean? | soft delete flag |
| targets | AppTarget[] | see below |
| sponsor | string | |
| imageUrl | string | pasted URL |
| bannerUrl | string | pasted URL |
| productActionUrl | string | CTA / affiliate link |
| topLabel | string | |
| bottomLabel | string | |
| code | string | promo/discount code |
| startDate | Timestamp? | |
| endDate | Timestamp? | |
| published | boolean | |
| attentionCounter | number | written by client apps only |
| consumptionCounter | number | written by client apps only |
| interestedUsers | string[] | written by client apps only |

### AppTarget (embedded in campaigns.targets)
| Field | Type | Notes |
|---|---|---|
| appId | string | matches id in targeting.config.ts |
| trainingId | number | |
| breakIndexes | number[] | positions within training session |

### groups
| Field | Type | Notes |
|---|---|---|
| id | string | Firestore document ID |
| name | string | |
| description | string? | |

> Groups reserved for future use.

## Business Rules
- Two campaigns cannot share the same (appId, trainingId) pair within overlapping date ranges
- Deletion is soft-only via `isDeleted: true`
- Analytics fields (`attentionCounter`, `consumptionCounter`, `interestedUsers`) are read-only in the manager — written exclusively by client apps via App Check
