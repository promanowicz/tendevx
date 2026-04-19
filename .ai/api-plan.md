# API Plan

All data access is via Firebase SDK directly (no REST backend). This document describes the Firestore operations used per resource.

## Authentication
Firebase Auth — email/password. JWT tokens managed by Firebase SDK.

## Resources

### Campaigns (`/campaigns`)

| Operation | SDK call | Auth required | Notes |
|---|---|---|---|
| List own campaigns | `query(where ownerId ==)` | Yes | filtered client-side for isDeleted |
| Get campaign | `getDoc` | No (public read) | |
| Create | `addDoc` | Yes | validates target overlap before write |
| Update | `updateDoc` | Yes (owner only) | re-validates overlap when dates/targets change |
| Soft delete | `updateDoc` isDeleted=true | Yes (owner only) | |
| Publish/unpublish | `updateDoc` published=true/false | Yes (owner only) | |

### Users (`/users`)

| Operation | SDK call | Auth required |
|---|---|---|
| Get profile | `getDoc` | Yes (own only) |
| Create profile | `setDoc` | Yes (own only) |
| Update profile | `updateDoc` | Yes (own only) |

### Analytics events (`/campaigns/{id}/events`) — future
Written by client apps with App Check. Manager reads/aggregates only.

## Firestore Security Rules Summary
- `campaigns`: public read (non-deleted), authenticated create (ownerId == auth.uid), authenticated update/delete (owner only)
- `users`: own document only
- `groups`: authenticated read/write (reserved)

## Targeting Config
App list and training name mappings live in `src/config/targeting.config.ts` — no Firestore reads needed.
