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
import type { Campaign } from '@/db/database.types';
import type { CreateCampaignData, UpdateCampaignData } from './types';
import { FirebaseError } from './types';

export class CampaignService {
  private readonly collectionRef = collection(db, 'campaigns');

  /**
   * Creates a new campaign
   * @param data Campaign data without system fields
   * @param userId Current user's ID
   * @returns Created campaign with generated UUID
   * @throws FirebaseError if creation fails
   */
  async createCampaign(data: CreateCampaignData, userId: string): Promise<Campaign> {
    try {
      // Validate required fields
      if (!data.title || !data.ownerId || !Array.isArray(data.groups)) {
        throw new Error('Missing required fields');
      }

      // Validate owner matches current user
      if (data.ownerId !== userId) {
        throw new Error('Invalid owner ID');
      }

      const timestamp = Timestamp.now();
      const campaignData: Omit<Campaign, 'uuid'> = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const docRef = await addDoc(this.collectionRef, campaignData);

      return {
        uuid: docRef.id,
        ...campaignData
      };
    } catch (error) {
      throw new FirebaseError(
        'Failed to create campaign',
        'campaign/creation-failed',
        error as Error
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
        ...docSnap.data()
      } as Campaign;
    } catch (error) {
      throw new FirebaseError(
        'Failed to retrieve campaign',
        'campaign/retrieval-failed',
        error as Error
      );
    }
  }

  /**
   * Updates an existing campaign
   * @param uuid Campaign UUID
   * @param data Partial campaign data to update
   * @param userId Current user's ID
   * @returns Updated campaign data
   * @throws FirebaseError if update fails or campaign not found
   */
  async updateCampaign(uuid: string, data: UpdateCampaignData, userId: string): Promise<Campaign> {
    try {
      const docRef = doc(this.collectionRef, uuid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Campaign not found');
      }

      // Verify ownership
      const campaign = docSnap.data() as Campaign;
      if (campaign.ownerId !== userId) {
        throw new Error('Unauthorized to update this campaign');
      }

      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);

      return {
        ...campaign,
        ...updateData
      };
    } catch (error) {
      throw new FirebaseError(
        'Failed to update campaign',
        'campaign/update-failed',
        error as Error
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
        where('ownerId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        uuid: doc.id,
        ...doc.data()
      })) as Campaign[];
    } catch (error) {
      throw new FirebaseError(
        'Failed to retrieve user campaigns',
        'campaign/user-campaigns-retrieval-failed',
        error as Error
      );
    }
  }
}
