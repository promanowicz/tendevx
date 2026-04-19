import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampaignService } from './campaign.service';
import type { AppTarget, Campaign } from '@/db/database.types';

// Prevent real Firebase initialization
vi.mock('@/db/firebase.client', () => ({ db: {} }));

const mockGetDocs = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  addDoc: vi.fn(),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  Timestamp: { now: vi.fn(() => ts(Date.now())) },
}));

// Helpers
const ts = (ms: number) => ({ toMillis: () => ms });
const DAY = 86_400_000;
const day = (n: number) => ts(n * DAY);

const makeTarget = (appId: string, trainingId: number): AppTarget => ({
  appId,
  trainingId,
  breakIndexes: [],
})

const makeCampaign = (overrides: Partial<Campaign>): Campaign => ({
  uuid: 'existing-1',
  ownerId: 'user-1',
  name: 'Existing campaign',
  description: '',
  targets: [makeTarget('MYAPP', 1)],
  sponsor: 'Sponsor',
  imageUrl: '',
  bannerUrl: '',
  productActionUrl: '',
  topLabel: '',
  code: '',
  bottomLabel: '',
  startDate: day(10) as any,
  endDate: day(20) as any,
  published: false,
  attentionCounter: 0,
  consumptionCounter: 0,
  interestedUsers: [],
  createdAt: day(0) as any,
  updatedAt: day(0) as any,
  isDeleted: false,
  ...overrides,
});

const makeSnapshot = (campaigns: Partial<Campaign>[]) => ({
  docs: campaigns.map(c => ({
    id: c.uuid ?? 'existing-1',
    data: () => makeCampaign(c),
  })),
});

// ─── datesOverlap ────────────────────────────────────────────────────────────

describe('CampaignService.datesOverlap', () => {
  const service = new CampaignService();
  const overlap = (a1: any, a2: any, b1: any, b2: any) =>
    (service as any).datesOverlap(a1, a2, b1, b2);

  it('returns false when new campaign has no start date', () => {
    expect(overlap(null, day(20), day(10), day(30))).toBe(false);
  });

  it('returns false when existing campaign has no start date', () => {
    expect(overlap(day(10), day(20), null, day(30))).toBe(false);
  });

  it('returns false when both start dates are null', () => {
    expect(overlap(null, null, null, null)).toBe(false);
  });

  it('returns false when A ends before B starts', () => {
    // A: days 1–5, B: days 6–10
    expect(overlap(day(1), day(5), day(6), day(10))).toBe(false);
  });

  it('returns false when B ends before A starts', () => {
    // A: days 6–10, B: days 1–5
    expect(overlap(day(6), day(10), day(1), day(5))).toBe(false);
  });

  it('returns false for adjacent campaigns (A ends exactly when B starts)', () => {
    // Boundary is exclusive: end of day 5 == start of day 5 → no overlap
    expect(overlap(day(1), day(5), day(5), day(10))).toBe(false);
  });

  it('returns true for partial overlap (A starts inside B)', () => {
    // A: 8–15, B: 5–12
    expect(overlap(day(8), day(15), day(5), day(12))).toBe(true);
  });

  it('returns true for partial overlap (B starts inside A)', () => {
    // A: 5–12, B: 8–15
    expect(overlap(day(5), day(12), day(8), day(15))).toBe(true);
  });

  it('returns true when ranges are identical', () => {
    expect(overlap(day(5), day(10), day(5), day(10))).toBe(true);
  });

  it('returns true when A completely contains B', () => {
    // A: 1–20, B: 5–10
    expect(overlap(day(1), day(20), day(5), day(10))).toBe(true);
  });

  it('returns true when B completely contains A', () => {
    // A: 5–10, B: 1–20
    expect(overlap(day(5), day(10), day(1), day(20))).toBe(true);
  });

  it('treats null end date on new campaign as open-ended', () => {
    // A starts day 15 with no end, B is days 10–20 → overlaps
    expect(overlap(day(15), null, day(10), day(20))).toBe(true);
  });

  it('treats null end date on existing campaign as open-ended', () => {
    // A: days 5–15, existing starts day 10 with no end → overlaps
    expect(overlap(day(5), day(15), day(10), null)).toBe(true);
  });

  it('returns true when both campaigns are open-ended and A starts before B ends (infinity)', () => {
    // Both open-ended: A starts day 1, B starts day 5 → A extends past B's start
    expect(overlap(day(1), null, day(5), null)).toBe(true);
  });

  it('returns false when open-ended B starts after open-ended A… wait: both infinite so they always overlap when starts differ', () => {
    // A starts day 10, no end. B starts day 1, no end. B's start < A's infinity → overlap
    expect(overlap(day(10), null, day(1), null)).toBe(true);
  });
});

// ─── assertNoTargetOverlap ───────────────────────────────────────────────────

describe('CampaignService.assertNoTargetOverlap', () => {
  let service: CampaignService;

  beforeEach(() => {
    service = new CampaignService();
    vi.clearAllMocks();
  });

  const check = (
    targets: AppTarget[],
    startDate: any,
    endDate: any,
    excludeUuid?: string,
  ) => (service as any).assertNoTargetOverlap(targets, startDate, endDate, excludeUuid);

  it('passes when there are no existing campaigns', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([]));
    await expect(check([makeTarget('MYAPP', 1)], day(10), day(20))).resolves.toBeUndefined();
  });

  it('passes when targets is empty', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { targets: [makeTarget('MYAPP', 1)], startDate: day(5) as any, endDate: day(15) as any },
    ]));
    await expect(check([], day(10), day(20))).resolves.toBeUndefined();
  });

  it('passes when existing campaign does not overlap in time', async () => {
    // Existing: days 1–5, new: days 6–10 — same target, no time overlap
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { targets: [makeTarget('MYAPP', 1)], startDate: day(1) as any, endDate: day(5) as any },
    ]));
    await expect(check([makeTarget('MYAPP', 1)], day(6), day(10))).resolves.toBeUndefined();
  });

  it('passes when dates overlap but targets differ (different appId)', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { targets: [makeTarget('MYAPP', 1)], startDate: day(5) as any, endDate: day(15) as any },
    ]));
    await expect(check([makeTarget('FITAPP', 1)], day(10), day(20))).resolves.toBeUndefined();
  });

  it('passes when dates overlap but targets differ (different trainingId)', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { targets: [makeTarget('MYAPP', 1)], startDate: day(5) as any, endDate: day(15) as any },
    ]));
    await expect(check([makeTarget('MYAPP', 2)], day(10), day(20))).resolves.toBeUndefined();
  });

  it('throws when appId and trainingId match and dates overlap', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { uuid: 'camp-a', name: 'Camp A', targets: [makeTarget('MYAPP', 1)], startDate: day(5) as any, endDate: day(15) as any },
    ]));
    await expect(check([makeTarget('MYAPP', 1)], day(10), day(20)))
      .rejects.toThrow('Camp A');
  });

  it('throws and includes appId and trainingId in the error message', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { name: 'X', targets: [makeTarget('FITAPP', 3)], startDate: day(5) as any, endDate: day(15) as any },
    ]));
    await expect(check([makeTarget('FITAPP', 3)], day(10), day(20)))
      .rejects.toThrow('FITAPP');
  });

  it('passes when conflicting campaign is soft-deleted', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { targets: [makeTarget('MYAPP', 1)], startDate: day(5) as any, endDate: day(15) as any, isDeleted: true },
    ]));
    await expect(check([makeTarget('MYAPP', 1)], day(10), day(20))).resolves.toBeUndefined();
  });

  it('passes when conflicting campaign matches excludeUuid (self-update)', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { uuid: 'self', targets: [makeTarget('MYAPP', 1)], startDate: day(5) as any, endDate: day(15) as any },
    ]));
    await expect(check([makeTarget('MYAPP', 1)], day(10), day(20), 'self')).resolves.toBeUndefined();
  });

  it('throws when one of multiple campaigns conflicts', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { uuid: 'a', name: 'Safe',     targets: [makeTarget('MYAPP', 1)], startDate: day(1)  as any, endDate: day(5)  as any },
      { uuid: 'b', name: 'Conflict', targets: [makeTarget('MYAPP', 1)], startDate: day(8)  as any, endDate: day(18) as any },
      { uuid: 'c', name: 'Safe2',    targets: [makeTarget('MYAPP', 1)], startDate: day(25) as any, endDate: day(30) as any },
    ]));
    await expect(check([makeTarget('MYAPP', 1)], day(10), day(20)))
      .rejects.toThrow('Conflict');
  });

  it('passes when new campaign has no start date (check skipped)', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { targets: [makeTarget('MYAPP', 1)], startDate: day(5) as any, endDate: day(15) as any },
    ]));
    await expect(check([makeTarget('MYAPP', 1)], null, day(20))).resolves.toBeUndefined();
  });

  it('throws when one of multiple new targets conflicts', async () => {
    // New campaign targets both MYAPP/1 and FITAPP/2. Existing has FITAPP/2 in the same period.
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { name: 'FitConflict', targets: [makeTarget('FITAPP', 2)], startDate: day(5) as any, endDate: day(15) as any },
    ]));
    await expect(check([makeTarget('MYAPP', 1), makeTarget('FITAPP', 2)], day(10), day(20)))
      .rejects.toThrow('FitConflict');
  });

  it('throws when new open-ended campaign overlaps existing one', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { name: 'OpenConflict', targets: [makeTarget('MYAPP', 1)], startDate: day(5) as any, endDate: day(20) as any },
    ]));
    await expect(check([makeTarget('MYAPP', 1)], day(12), null))
      .rejects.toThrow('OpenConflict');
  });

  it('throws when existing open-ended campaign overlaps new one', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { name: 'Infinite', targets: [makeTarget('MYAPP', 1)], startDate: day(5) as any, endDate: null },
    ]));
    await expect(check([makeTarget('MYAPP', 1)], day(10), day(20)))
      .rejects.toThrow('Infinite');
  });
});
