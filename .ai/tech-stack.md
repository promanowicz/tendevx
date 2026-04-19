# Tech Stack

## Frontend
- Vue 3 (Composition API) + TypeScript
- Pinia (state management)
- Vue Router
- Vite

## Backend
- Firebase Auth — email/password authentication
- Firestore — primary data store
- Firebase Hosting — static hosting

## Firebase Architecture
- **Commercial Manager instance** (`comman-2424b`) — auth, user profiles, campaign management
- **Central campaigns instance** (to be created) — campaign data shared with client apps; public read, authenticated write, App Check enforced for client app writes

## AI
- OpenRouter service (`openrouter-service.ts`) wrapping OpenAI-compatible API
- AI features hidden pending access level definition

## Testing
- Vitest — unit tests
- Playwright — e2e tests

## CI/CD
- GitHub Actions
- Firebase Hosting deploy on merge to main
