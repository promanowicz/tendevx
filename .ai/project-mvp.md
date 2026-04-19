# Commercial Manager — MVP

## Purpose
Web app for managing commercial campaigns distributed to client fitness apps.
Each campaign targets specific apps, training sessions, and break positions within those sessions.

## Implemented
- Auth: register, login, logout, password reset
- Campaign CRUD: create, list, view, edit, soft-delete, publish/unpublish
- Targeting: per-app targeting with trainingId (autocomplete with name mapping) and break indexes
- Overlap validation: prevents two campaigns from sharing the same (appId, trainingId) in overlapping date ranges
- Analytics display: impressions, clicks, interested users (read-only, written by client apps)
- Firestore security rules: public read on campaigns, authenticated write, owner-only update/delete

## Pending
- Central Firebase instance creation and migration
- App Check setup for client app writes
- Analytics events subcollection + aggregation
- AI suggestions (OpenRouter service exists, UI hidden pending access level design)
- Groups / access control

## Out of Scope
- Integration with Google Ads, Facebook Ads
- Video / animation ad formats
- CRM integration
- Mobile app
