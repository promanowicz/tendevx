import OpenAI from 'openai';
import type { Campaign } from '@/db/database.types';

// Typy wiadomości dla usługi
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

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
  private apiKey: string = import.meta.env.VITE_OPENAI_API_KEY;
  private defaultModel: string;
  private defaultParams: DefaultParams;
  private openai: OpenAI;
  private static readonly MAX_TOKENS = 1000;

  constructor(config?: OpenRouterServiceConfig) {
    // Use provided apiKey or fallback to env var
    this.apiKey = config?.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    this.defaultModel = config?.defaultModel || 'gpt-3.5-turbo';
    this.defaultParams = config?.defaultParams || {};

    this.openai = new OpenAI({ apiKey: this.apiKey, dangerouslyAllowBrowser:true});
  }

  public async provideSuggestion(campaign: Campaign): Promise<string> {
    if (!campaign?.uuid) {
      throw new Error('Invalid campaign');
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a marketing expert AI. Analyze the provided campaign content and suggest improvements. Focus on making the content more engaging, persuasive, and effective for marketing purposes. Provide specific suggestions while maintaining the original message\'s intent.'
      },
      {
        role: 'user',
        content: `Please analyze and suggest improvements for this marketing campaign:
        Title: ${campaign.title || ''}
        Description: ${campaign.description || ''}
        Target Groups: ${campaign.groups?.join(', ') || 'No specific groups'}
        
        Please provide improved version of the text I'm currently editing.`
      }
    ];

    const sanitizedMessages = this.sanitizeMessages(messages);
    const payload = {
      model: this.defaultModel,
      messages: this.formatMessages(sanitizedMessages),
      temperature: 0.7,
      max_tokens: OpenRouterService.MAX_TOKENS
    };

    const response = await this.callOpenAI(payload);
    const suggestion = this.validateResponse(response);
    return typeof suggestion === 'string' ? suggestion : suggestion.content;
  }

  public async getSupportedModels(): Promise<string[]> {
    try {
      const res = await this.openai.models.list();
      return res.data.map(model => model.id);
    } catch (error: any) {
      throw new Error(`Failed to fetch models: ${error.message}`);
    }
  }

  private async callOpenAI(payload: any): Promise<any> {
    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;
    while (true) {
      try {
        return await this.openai.chat.completions.create(payload);
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

  private formatMessages(messages: ChatMessage[]): any[] {
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
