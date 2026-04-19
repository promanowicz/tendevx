# PRD — Commercial Manager

## Overview
Tool for marketing teams to create and manage commercial campaigns distributed to client fitness apps.
Campaigns contain sponsor content (images, labels, promo codes, CTA links) and are targeted to specific apps and training sessions.

## User Stories

### Auth
- **US-001** Register with name, email, password
- **US-002** Login with email/password; "forgot password" flow
- **US-008** Logout; auto-logout after 30min inactivity

### Campaigns
- **US-003** Create campaign: name, description, sponsor, labels, promo code, image/banner URLs, action URL, targeting (app + training + breaks), schedule dates
- **US-004** List campaigns with status badge (Published/Draft), sponsor, dates, analytics summary
- **US-005** Edit all campaign fields; publish/unpublish toggle independent of edit mode
- **US-010** Publish/unpublish: controls whether campaign is visible to client apps

### Analytics (read-only in manager)
- **US-006** View per-campaign stats: impressions (`attentionCounter`), clicks (`consumptionCounter`), interested users count
- Stats written by client apps via App Check; manager displays aggregated values

### AI (hidden — pending access level design)
- **US-007** AI suggestions for campaign content via OpenRouter

### Profile
- **US-009** Edit name; change password

## Validation Rules
- Two campaigns cannot target the same (appId, trainingId) with overlapping date ranges
- Campaign deletion is soft-only

## Access Levels
- Currently single level; full vs limited access deferred
