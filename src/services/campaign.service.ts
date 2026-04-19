import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/db/firebase.client';
import type { AppTarget, Campaign } from '@/db/database.types';
import type { CreateCampaignData, UpdateCampaignData } from './types';
import { FirebaseError } from './types';

export class CampaignService {
  private readonly collectionRef = collection(db, 'campaigns');

  /**
   * Returns true if two date ranges overlap.
   * A null end date is treated as open-ended (no expiry).
   * If either range has no start date the check is skipped (returns false).
   */
  private datesOverlap(
    aStart: Timestamp | null,
    aEnd: Timestamp | null,
    bStart: Timestamp | null,
    bEnd: Timestamp | null,
  ): boolean {
    if (!aStart || !bStart) return false;

    const aEndMs = aEnd ? aEnd.toMillis() : Infinity;
    const bEndMs = bEnd ? bEnd.toMillis() : Infinity;

    return aStart.toMillis() < bEndMs && bStart.toMillis() < aEndMs;
  }

  /**
   * Checks whether any active campaign shares an (appId, trainingId) target
   * with the provided targets and has an overlapping date range.
   * Throws if a conflict is found.
   * @param targets Targets of the new/updated campaign
   * @param startDate New campaign start date
   * @param endDate New campaign end date
   * @param excludeUuid Campaign UUID to exclude (used when updating)
   */
  private async assertNoTargetOverlap(
    targets: AppTarget[],
    startDate: Timestamp | null,
    endDate: Timestamp | null,
    excludeUuid?: string,
  ): Promise<void> {
    if (!targets.length) return;

    const snapshot = await getDocs(this.collectionRef);

    for (const docSnap of snapshot.docs) {
      if (excludeUuid && docSnap.id === excludeUuid) continue;

      const existing = { uuid: docSnap.id, ...docSnap.data() } as Campaign;
      if (existing.isDeleted) continue;
      if (!this.datesOverlap(startDate, endDate, existing.startDate, existing.endDate)) continue;

      for (const newTarget of targets) {
        const conflict = (existing.targets ?? []).find(
          t => t.appId === newTarget.appId && t.trainingId === newTarget.trainingId,
        );
        if (conflict) {
          throw new Error(
            `Campaign "${existing.name}" already targets ${newTarget.appId} / training ${newTarget.trainingId} during this period.`,
          );
        }
      }
    }
  }

  /**
   * Creates a new campaign
   * @param data Campaign data without system fields
   * @param userId Current user's ID
   * @returns Created campaign with generated UUID
   * @throws FirebaseError if creation fails or dates overlap
   */
  async createCampaign(data: CreateCampaignData & { ownerId: string }, userId: string): Promise<Campaign> {
    try {
      if (!data.name || !data.ownerId) {
        throw new Error('Missing required fields');
      }

      if (data.ownerId !== userId) {
        throw new Error('Invalid owner ID');
      }

      await this.assertNoTargetOverlap(data.targets ?? [], data.startDate, data.endDate);

      const timestamp = Timestamp.now();
      const campaignData: Omit<Campaign, 'uuid'> = {
        ...data,
        attentionCounter: 0,
        consumptionCounter: 0,
        interestedUsers: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const docRef = await addDoc(this.collectionRef, campaignData);

      return {
        uuid: docRef.id,
        ...campaignData,
      };
    } catch (error) {
      throw new FirebaseError(
        (error as Error).message || 'Failed to create campaign',
        'campaign/creation-failed',
        error as Error,
      );
    }
  }

  /**
   * Retrieves a campaign by its UUID
   * @param uuid Campaign UUID
   * @returns Campaign data or null if not found
   * @throws FirebaseError if retrieval fails
   */
  async getCampaign(uuid: string): Promise<Campaign | null> {
    try {
      const docRef = doc(this.collectionRef, uuid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        uuid: docSnap.id,
        ...docSnap.data(),
      } as Campaign;
    } catch (error) {
      throw new FirebaseError(
        'Failed to retrieve campaign',
        'campaign/retrieval-failed',
        error as Error,
      );
    }
  }

  /**
   * Updates an existing campaign
   * @param uuid Campaign UUID
   * @param data Partial campaign data to update
   * @param userId Current user's ID
   * @returns Updated campaign data
   * @throws FirebaseError if update fails, campaign not found, or dates overlap
   */
  async updateCampaign(uuid: string, data: UpdateCampaignData, userId: string): Promise<Campaign> {
    try {
      const docRef = doc(this.collectionRef, uuid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Campaign not found');
      }

      const campaign = { uuid: docSnap.id, ...docSnap.data() } as Campaign;

      if (campaign.ownerId !== userId) {
        throw new Error('Unauthorized to update this campaign');
      }

      // Only check overlap when dates or targets are part of this update
      const affectsDates = 'startDate' in data || 'endDate' in data || 'targets' in data;
      if (affectsDates) {
        const targets = data.targets ?? campaign.targets ?? [];
        const startDate = 'startDate' in data ? data.startDate! : campaign.startDate;
        const endDate = 'endDate' in data ? data.endDate! : campaign.endDate;
        await this.assertNoTargetOverlap(targets, startDate, endDate, uuid);
      }

      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      return {
        ...campaign,
        ...updateData,
      };
    } catch (error) {
      throw new FirebaseError(
        (error as Error).message || 'Failed to update campaign',
        'campaign/update-failed',
        error as Error,
      );
    }
  }

  /**
   * Retrieves all campaigns owned by a specific user
   * @param userId Owner's user ID
   * @returns Array of campaigns
   * @throws FirebaseError if retrieval fails
   */
  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    try {
      const q = query(
        this.collectionRef,
        where('ownerId', '==', userId),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        uuid: doc.id,
        ...doc.data(),
      })) as Campaign[];
    } catch (error) {
      throw new FirebaseError(
        'Failed to retrieve user campaigns',
        'campaign/user-campaigns-retrieval-failed',
        error as Error,
      );
    }
  }

  /**
   * Soft deletes a campaign by setting isDeleted to true
   * @param uuid Campaign UUID
   * @param userId Current user's ID
   * @throws FirebaseError if update fails or campaign not found
   */
  async deleteCampaign(uuid: string, userId: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, uuid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Campaign not found');
      }
      const data = docSnap.data();
      if (data.ownerId !== userId) {
        throw new Error('You are not authorized to delete this campaign');
      }
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      throw new FirebaseError(
        'Failed to delete campaign',
        'campaign/delete-failed',
        error as Error,
      );
    }
  }
}
