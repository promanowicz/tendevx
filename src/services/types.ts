import type { Campaign, User, Group } from '@/db/database.types';

export type CreateCampaignData = Omit<Campaign, 'uuid' | 'createdAt' | 'updatedAt'>;
export type UpdateCampaignData = Partial<Omit<Campaign, 'uuid' | 'createdAt' | 'updatedAt' | 'ownerId'>>;

export type CreateUserData = Omit<User, 'id'>;
export type UpdateUserData = Partial<Omit<User, 'id' | 'email'>>;

export type CreateGroupData = Omit<Group, 'id'>;
export type UpdateGroupData = Partial<Omit<Group, 'id'>>;

export class FirebaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FirebaseError';
  }
}
