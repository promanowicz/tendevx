import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterService } from './openrouter-service';
import type { Campaign } from '@/db/database.types';
import OpenAI from 'openai';

// Mock the OpenAIApi class
vi.mock('openai', () => {
  const create = vi.fn();
  const list = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: { completions: { create } },
      models: { list }
    })),
    __esModule: true
  };
});

const mockApi = new OpenAI() as any;

// Stub sleep to avoid real delays
vi.spyOn(OpenRouterService.prototype as any, 'sleep').mockResolvedValue(undefined);

describe('OpenRouterService', () => {
  const service = new OpenRouterService({ apiKey: 'test-key' });
  const sampleCampaign: Campaign = { uuid: 'campaign-123' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses simple successful response', async () => {
    mockApi.chat.completions.create.mockResolvedValue({ choices: [{ message: { content: 'hello world' } }] });
    const result = await service.provideSuggestion(sampleCampaign);
    expect(mockApi.chat.completions.create).toHaveBeenCalled();
    expect(result).toBe('hello world');
  });

  it('parses function_call response arguments', async () => {
    const args = { foo: 'bar' };
    mockApi.chat.completions.create.mockResolvedValue({ choices: [{ message: { function_call: { arguments: JSON.stringify(args) } } }] });
    const result = await service.provideSuggestion(sampleCampaign);
    expect(result).toBe(JSON.stringify(args));
  });

  it('retries on network errors and succeeds', async () => {
    // first two calls throw network error (no response), third succeeds
    mockApi.chat.completions.create
      .mockRejectedValueOnce({})
      .mockRejectedValueOnce({})
      .mockResolvedValue({ choices: [{ message: { content: 'retry success' } }] });
    const result = await service.provideSuggestion(sampleCampaign);
    expect(mockApi.chat.completions.create).toHaveBeenCalledTimes(3);
    expect(result).toBe('retry success');
  });

  it('throws on unauthorized (401)', async () => {
    mockApi.chat.completions.create.mockRejectedValue({ response: { status: 401 }, message: 'unauthorized' });
    await expect(service.provideSuggestion(sampleCampaign)).rejects.toThrow('Sprawdź klucz API');
  });

  it('throws on rate limit after retries', async () => {
    mockApi.chat.completions.create.mockRejectedValue({ response: { status: 429 }, message: 'rate' });
    await expect(service.provideSuggestion(sampleCampaign)).rejects.toThrow('Rate limit exceeded, please try again later');
  });

  it('fetches supported models', async () => {
    const modelList = ['model1', 'model2'];
    mockApi.models.list.mockResolvedValue({ data: modelList.map(id => ({ id })) });
    const models = await service.getSupportedModels();
    expect(models).toEqual(modelList);
  });

  it('propagates error on listModels failure', async () => {
    mockApi.models.list.mockRejectedValue({ message: 'fail' });
    await expect(service.getSupportedModels()).rejects.toThrow('Failed to fetch models: fail');
  });
});
