import { Timestamp } from 'firebase/firestore';

/**
 * User document type in Firestore
 */
export interface User {
  id: string; // Firebase Auth user id, unique
  name: string;
  email: string;
  groups: string[]; // references to group identifiers
}

/**
 * Campaign document type in Firestore
 */
export interface Campaign {
  uuid: string; // unique campaign identifier
  ownerId: string; // reference to a user via Firebase Auth user id

  // Manager-internal fields
  name: string; // internal campaign name for organizing
  description: string; // internal notes/description
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDeleted?: boolean;

  // Commercial content fields (consumed by client apps)
  trainingId: number;
  breakIndexes: number[];
  sponsor: string;
  imageUrl: string;
  bannerUrl: string;
  productActionUrl: string;
  topLabel: string;
  code: string;
  bottomLabel: string;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  published: boolean;

  // Analytics — written by client apps, read-only in manager
  attentionCounter: number;
  consumptionCounter: number;
  interestedUsers: string[];
}

/**
 * Group document type in Firestore
 */
export interface Group {
  id: string; // unique group identifier
  name: string;
  description?: string; // optional
}

/**
 * Firestore Database schema
 */
export interface FirestoreSchema {
  'users': User;
  'campaigns': Campaign;
  'groups': Group;
}
