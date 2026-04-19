# AI Service

## Current Implementation
`src/services/openrouter-service.ts` — wraps OpenAI-compatible API via OpenRouter.

### Key behaviours
- Retries on network errors (up to 3 attempts with backoff)
- Throws user-friendly message on 401 ("Sprawdź klucz API")
- Throws on 429 rate limit after retries
- Parses both `content` and `function_call.arguments` response formats

### Config
```
VITE_OPENAI_API_KEY=your_openrouter_key
```

## UI Status
AI suggestion buttons are commented out / hidden. Access level design (full vs limited users) is required before exposing them.

## Future Integration
- Hook into campaign edit flow: suggest improvements to `topLabel`, `bottomLabel`, `sponsor` text
- Input: full Campaign object
- Output: text suggestion, user can apply or reject
