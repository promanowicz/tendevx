import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterService } from './openrouter-service';
import type { Campaign } from '@/db/database.types';
import { OpenAIApi } from 'openai';

// Mock the OpenAIApi class
vi.mock('openai', () => {
  const createChatCompletion = vi.fn();
  const listModels = vi.fn();
  return {
    Configuration: vi.fn(),
    OpenAIApi: vi.fn().mockImplementation(() => ({ createChatCompletion, listModels })),
    __esModule: true
  };
});

const mockApi = new OpenAIApi() as any;

// Stub sleep to avoid real delays
vi.spyOn(OpenRouterService.prototype as any, 'sleep').mockResolvedValue(undefined);

describe('OpenRouterService', () => {
  const service = new OpenRouterService({ apiKey: 'test-key' });
  const sampleCampaign: Campaign = { uuid: 'campaign-123' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses simple successful response', async () => {
    mockApi.createChatCompletion.mockResolvedValue({ data: { choices: [{ message: { content: 'hello world' } }] } });
    const result = await service.provideSuggestion(sampleCampaign);
    expect(mockApi.createChatCompletion).toHaveBeenCalled();
    expect(result).toBe('hello world');
  });

  it('parses function_call response arguments', async () => {
    const args = { foo: 'bar' };
    mockApi.createChatCompletion.mockResolvedValue({ data: { choices: [{ message: { function_call: { arguments: JSON.stringify(args) } } }] } });
    const result = await service.provideSuggestion(sampleCampaign);
    expect(result).toBe(JSON.stringify(args));
  });

  it('retries on network errors and succeeds', async () => {
    // first two calls throw network error (no response), third succeeds
    mockApi.createChatCompletion
      .mockRejectedValueOnce({})
      .mockRejectedValueOnce({})
      .mockResolvedValue({ data: { choices: [{ message: { content: 'retry success' } }] } });
    const result = await service.provideSuggestion(sampleCampaign);
    expect(mockApi.createChatCompletion).toHaveBeenCalledTimes(3);
    expect(result).toBe('retry success');
  });

  it('throws on unauthorized (401)', async () => {
    mockApi.createChatCompletion.mockRejectedValue({ response: { status: 401 }, message: 'unauthorized' });
    await expect(service.provideSuggestion(sampleCampaign)).rejects.toThrow('Sprawdź klucz API');
  });

  it('throws on rate limit after retries', async () => {
    mockApi.createChatCompletion.mockRejectedValue({ response: { status: 429 }, message: 'rate' });
    await expect(service.provideSuggestion(sampleCampaign)).rejects.toThrow('Rate limit exceeded, please try again later');
  });

  it('fetches supported models', async () => {
    const modelList = ['model1', 'model2'];
    mockApi.listModels.mockResolvedValue({ data: { data: modelList.map(id => ({ id })) } });
    const models = await service.getSupportedModels();
    expect(models).toEqual(modelList);
  });

  it('propagates error on listModels failure', async () => {
    mockApi.listModels.mockRejectedValue({ message: 'fail' });
    await expect(service.getSupportedModels()).rejects.toThrow('Failed to fetch models: fail');
  });
});
