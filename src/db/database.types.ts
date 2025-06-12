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
  title: string;
  description: string;
  groups: string[]; // references to group identifiers;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
