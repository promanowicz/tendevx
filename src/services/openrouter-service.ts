import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';
import type { CreateChatCompletionRequest } from 'openai';
import type { Campaign } from '@/db/database.types';

// Typy wiadomości dla usługi
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type OpenAIMessage = ChatCompletionRequestMessage;

// Parametry domyślne dla wywołań
export interface DefaultParams {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

export interface OpenRouterServiceConfig {
  apiKey: string;
  defaultModel?: string;
  defaultParams?: DefaultParams;
}

export class OpenRouterService {
  private apiKey: string;
  private defaultModel: string;
  private defaultParams: DefaultParams;
  private openai: OpenAIApi;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private static readonly MAX_TOKENS = 1000;

  constructor(config: OpenRouterServiceConfig) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || 'gpt-3.5-turbo';
    this.defaultParams = config.defaultParams || {};

    const configuration = new Configuration({ apiKey: this.apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  public async provideSuggestion(campaign: Campaign): Promise<string> {
    if (!campaign?.uuid?.trim()) {
      throw new Error('Invalid campaign');
    }
    const campaignId = campaign.uuid;
    let messages: ChatMessage[] = [
      { role: 'system', content: 'You are a marketing expert AI assisting with campaign optimization.' },
      { role: 'user', content: `Provide optimization suggestions for campaign ${campaignId}.` }
    ];
    // sanitize and trim messages
    messages = this.sanitizeMessages(messages);
    const functions = [
      {
        name: 'provideSuggestion',
        description: 'Generates AI suggestions for campaign optimization',
        parameters: { campaignId: { type: 'string', description: 'ID of the campaign' } }
      }
    ];
    const payload: CreateChatCompletionRequest = {
      model: this.defaultModel,
      messages: this.formatMessages(messages),
      functions,
      ...this.defaultParams
    };
    // enforce hard cap on tokens
    payload.max_tokens = Math.min(payload.max_tokens ?? OpenRouterService.MAX_TOKENS, OpenRouterService.MAX_TOKENS);
    const response = await this.callOpenAI(payload);
    const valid = this.validateResponse(response);
    return typeof valid === 'string' ? valid : valid.content;
  }

  public async getSupportedModels(): Promise<string[]> {
    try {
      const res = await this.openai.listModels();
      return res.data.data.map(model => model.id);
    } catch (error: any) {
      throw new Error(`Failed to fetch models: ${error.message}`);
    }
  }

  private async callOpenAI(payload: CreateChatCompletionRequest): Promise<any> {
    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;
    while (true) {
      try {
        const res = await this.openai.createChatCompletion(payload);
        return res.data;
      } catch (error: any) {
        const status = error.response?.status;
        const isNetwork = !error.response;
        if ((status === 429 || isNetwork) && attempt < maxRetries) {
          attempt++;
          await this.sleep(delay);
          delay *= 2;
          continue;
        }
        if (status === 401) throw new Error('Sprawdź klucz API');
        if (status === 429) throw new Error('Rate limit exceeded, please try again later');
        throw new Error(`OpenAI error: ${error.message}`);
      }
    }
  }

  private formatMessages(messages: ChatMessage[]): OpenAIMessage[] {
    return messages.map(msg => ({ role: msg.role, content: msg.content }));
  }

  private validateResponse(response: any): { content: string; } | string {
     const choice = response.choices?.[0]?.message;
     if (!choice) throw new Error('No response from OpenAI');
     if (choice.function_call) {
       try {
         const args = JSON.parse(choice.function_call.arguments || '{}');
         return { content: JSON.stringify(args) };
       } catch (err) {
        console.error('JSON parse error in function_call arguments:', (err as Error).message);
         return choice.content || '';
       }
     }
    return choice.content || '';
  }

  private sleep(ms: number): Promise<void> {
     return new Promise(resolve => setTimeout(resolve, ms));
  }
  // sanitize content by removing control/non-printable chars and trim length
  private sanitizeContent(content: string): string {
    return content.slice(0, 2000);
  }
  // enforce allowable roles and sanitized content
  private sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(msg => ({ role: msg.role, content: this.sanitizeContent(msg.content) }));
  }
}
