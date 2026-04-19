# Project Guidelines

Vue 3 + TypeScript + Vite + Pinia + Vue Router. Firebase Auth + Firestore. Vitest + Playwright. ESLint.

## Code style
- Use Vue 3 Composition API for all views and components
- All Firestore access via TypeScript service classes (`src/services/`)
- Use `useCampaign` composable in views — never call services directly from views
- Keep Firestore types in `src/db/database.types.ts`

## Data model
- Campaign targeting uses `AppTarget[]` (appId + trainingId + breakIndexes) — not flat fields
- App list and training name mappings live in `src/config/targeting.config.ts`
- Analytics fields (`attentionCounter`, `consumptionCounter`, `interestedUsers`) are read-only in the manager

## Firebase
- Local dev uses emulators: Firestore on :8081, Auth on :9099 (auto-connected in DEV mode)
- Security rules in `firestore.rules`
- Central Firebase instance (for client apps) is separate — not yet created

## AI features
- OpenRouter service exists at `src/services/openrouter-service.ts`
- AI UI is hidden — do not expose until access level design is complete

## Adding new apps or training names
- Edit `src/config/targeting.config.ts` only — no Firestore changes needed
