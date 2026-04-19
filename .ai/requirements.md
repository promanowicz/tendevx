# Requirements

## Functional
1. Auth — register, login, logout, password reset
2. Campaign CRUD — create, view, edit, soft-delete
3. Campaign targeting — per-app (appId), per-training (trainingId + breakIndexes); no date range overlap allowed for same (appId, trainingId)
4. Campaign scheduling — startDate, endDate, publish toggle
5. Analytics — read-only display of impressions, clicks, interested users; data written by client apps
6. AI suggestions — implemented but hidden; requires access level design

## Non-Functional
- Minimise Firebase reads/writes: targeting config is static (no Firestore reads); analytics use counters on campaign doc (client apps write) rather than fan-out
- Security: Firestore rules enforce ownership; App Check planned for client app writes to central instance

## Architecture Decisions
- Central Firebase instance (separate from manager's own instance) will serve campaign data to all client apps
- Client apps read campaigns directly from Firestore (public read)
- Client apps write analytics events with App Check verification
- No Cloud Functions for campaign reads (direct Firestore access is cheaper)
