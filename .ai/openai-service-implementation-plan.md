# Plan implementacji usługi OpenAI (AIService)

## 1. Opis usługi
Usługa `AIService` zapewnia integrację z OpenAI API w celu generowania ustrukturyzowanych odpowiedzi opartych na modelach LLM (np. ChatGPT). Odpowiedzialna jest za:
- Budowanie komunikatów system/user.
- Definiowanie oraz przekazywanie funkcji (tools) do modelu.
- Konfigurowanie parametrów modeli (model, temperature, top_p, max_tokens).
- Parsowanie odpowiedzi w formacie JSON.

## 2. Konstruktor
```typescript
constructor(config: {
  apiKey: string;
  defaultModel?: string;
  defaultParams?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
})
```
- `apiKey`: klucz dostępu do OpenAI (przechowywany w .env).
- `defaultModel`: np. `gpt-4`, `gpt-3.5-turbo`.
- `defaultParams`: domyślne parametry dla wywołań.

## 3. Publiczne metody i pola

### provideSuggestion(campaignId: string): Promise<string>
```typescript
async provideSuggestion(campaignId: string): Promise<string> {
  const aiResponse = await this.generateChatCompletion({
    messages: [
      { role: 'system', content: 'You are a marketing expert AI assisting with campaign optimization.' },
      { role: 'user', content: `Provide optimization suggestions for campaign ${campaignId}.` }
    ],
    functions: [
      {
        name: 'provideSuggestion',
        description: 'Generates AI suggestions for campaign optimization',
        parameters: {
          campaignId: { type: 'string', description: 'ID of the campaign' }
        }
      }
    ]
  });
  return typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
}
```

## 4. Prywatne metody i pola

- `private apiUrl = 'https://api.openai.com/v1/chat/completions'`
- `private callOpenAI(payload): Promise<any>`
  - Ustawia nagłówki (`Authorization`, `Content-Type`).
  - Obsługuje fetch + timeout.
  - Parsuje JSON.

- `private formatMessages(messages: ChatMessage[]): OpenAIMessage[]`
  - Mapuje nasze typy na format OpenAI.

- `private validateResponse(response: any): any`
  - Sprawdza, czy odpowiedź zawiera funkcję do wywołania lub content.

## 5. Obsługa błędów
1. Nieprawidłowy klucz API (401) ➔ komunikat: „Sprawdź klucz API”.
2. Ograniczenia rate limit (429) ➔ retry z backoff.
3. Błędy sieciowe (fetch failed) ➔ retry / komunikat użytkownikowi.
4. Błędne parsowanie JSON ➔ log + fallback.
5. Błędy walidacji funkcji ➔ komunikat debug.

## 6. Kwestie bezpieczeństwa
- Przechowuj `apiKey` w `.env` (never commit).
- Używaj HTTPS.
- Waliduj oraz sanitizuj wszystkie wejściowe komunikaty.
- Ogranicz maksymalną długość parametrów (max_tokens).
- Loguj błędy, ale nie eksponuj surowych odpowiedzi.

## 7. Plan wdrożenia krok po kroku

1. Instalacja zależności:
   ```bash
   npm install openai
   ```

2. Konfiguracja środowiska:
   - Dodaj do `.env`:
     ```dotenv
     VITE_OPENAI_API_KEY=your_api_key_here
     ```

3. Utwórz plik usługi:
   - `src/services/openai.service.ts`.
   - Zaimportuj `Configuration`, `OpenAIApi` z pakietu `openai`.

4. Implementacja konstruktora i metod:
   - Zainicjalizuj `OpenAIApi` z `apiKey`.
   - Dodaj metody publiczne (`provideSuggestion`, `getSupportedModels`).
   - Dodaj prywatne pomocnicze (`callOpenAI`, `formatMessages`).

5. Konfiguracja wiadomości:
  - System messages: pierwsza wiadomość z instrukcjami.
  - User messages: zbierane od użytkownika.
  - Opcjonalne `functions`: zadeklaruj w kodzie jako JS schema.

6. Parsowanie odpowiedzi:
   - Użyj `response_format: 'json'` w parametrach funkcji (jeśli wymagane).
   - W `validateResponse` wyodrębnij `function_call` i `content`.

7. Integracja w komponencie Vue:
   - Importuj `AIService` w composable `useCampaign.ts`.
   - Wywołuj `provideSuggestion` przy wysyłce czatu.

8. Testowanie:
   - Unit testy metod serwisu (Vitest).
   - Mockuj OpenAI API.

9. Wdrażanie:
    - Zbuduj projekt: `npm run build`.
    - Deploy na Firebase Hosting / Functions.

---

**Przykładowe użycie**:
```typescript
const ai = new AIService({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, defaultModel: 'gpt-3.5-turbo' });
const suggestion = await ai.provideSuggestion('campaign123');
console.log(suggestion);
```
