import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from '@/db/firebase.client';
import type { User } from '@/db/database.types';
import type { CreateUserData, UpdateUserData } from './types';
import { FirebaseError } from './types';

export class UserService {
  private readonly collectionRef = collection(db, 'users');

  /**
   * Creates a new user account and profile
   * @param email User's email
   * @param password User's password
   * @param data User profile data
   * @returns Created user profile
   * @throws FirebaseError if registration fails
   */
  async register(
    email: string,
    password: string,
    data: CreateUserData
  ): Promise<User> {
    try {
      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user profile in Firestore
      const user: User = {
        id: userCredential.user.uid,
        email,
        name: data.name,
        groups: data.groups || []
      };

      await setDoc(doc(this.collectionRef, user.id), user);

      // Update display name in Firebase Auth
      await updateProfile(userCredential.user, {
        displayName: data.name
      });

      return user;
    } catch (error) {
      throw new FirebaseError(
        'Failed to register user',
        'auth/registration-failed',
        error as Error
      );
    }
  }

  /**
   * Signs in a user
   * @param email User's email
   * @param password User's password
   * @returns User profile data
   * @throws FirebaseError if sign in fails
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      return this.getUserProfile(userCredential.user.uid);
    } catch (error) {
      throw new FirebaseError(
        'Failed to sign in',
        'auth/sign-in-failed',
        error as Error
      );
    }
  }

  /**
   * Signs out the current user
   * @throws FirebaseError if sign out fails
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw new FirebaseError(
        'Failed to sign out',
        'auth/sign-out-failed',
        error as Error
      );
    }
  }

  /**
   * Retrieves a user's profile
   * @param userId User ID
   * @returns User profile data
   * @throws FirebaseError if retrieval fails
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const docRef = doc(this.collectionRef, userId);
      const docSnap = await getDoc(docRef);

      // if (!docSnap.exists()) {
      //   throw new Error('User profile not found');
      // }

      return docSnap.data() as User;
    } catch (error) {
      throw new FirebaseError(
        'Failed to retrieve user profile',
        'user/profile-retrieval-failed',
        error as Error
      );
    }
  }

  /**
   * Updates a user's profile
   * @param userId User ID
   * @param data Profile data to update
   * @returns Updated user profile
   * @throws FirebaseError if update fails
   */
  async updateUserProfile(userId: string, data: UpdateUserData): Promise<User> {
    try {
      const docRef = doc(this.collectionRef, userId);
      await updateDoc(docRef, data);

      // If name is updated, update it in Firebase Auth as well
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.name
        });
      }

      return this.getUserProfile(userId);
    } catch (error) {
      throw new FirebaseError(
        'Failed to update user profile',
        'user/profile-update-failed',
        error as Error
      );
    }
  }

  /**
   * Sends a password reset email
   * @param email User's email address
   * @throws FirebaseError if sending reset email fails
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new FirebaseError(
        'Failed to send password reset email',
        'auth/password-reset-failed',
        error as Error
      );
    }
  }
}
