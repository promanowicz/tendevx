import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { auth } from '@/db/firebase.client';
import type { User as FirebaseUser } from 'firebase/auth';
import { UserService } from '@/services/user.service';
import type { User } from '@/db/database.types';

const userService = new UserService();

export const useAuthStore = defineStore('auth', () => {
  const firebaseUser = ref<FirebaseUser | null>(null);
  const userProfile = ref<User | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  // Computed properties
  const isAuthenticated = computed(() => !!firebaseUser.value);
  const userId = computed(() => firebaseUser.value?.uid);
  const userEmail = computed(() => firebaseUser.value?.email);

  // Actions
  async function initialize() {
    isLoading.value = true;
    error.value = null;

    try {
      // Set up Firebase Auth state observer
      auth.onAuthStateChanged(async (user) => {
        firebaseUser.value = user;

        if (user) {
          // Load user profile from Firestore
          userProfile.value = await userService.getUserProfile(user.uid);
        } else {
          userProfile.value = null;
        }

        isLoading.value = false;
      });
    } catch (e) {
      error.value = (e as Error).message;
      isLoading.value = false;
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const user = await userService.signIn(email, password);
      userProfile.value = user;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email: string, password: string, name: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const user = await userService.register(email, password, { email, name, groups: [] });
      userProfile.value = user;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    error.value = null;

    try {
      await userService.signOut();
      userProfile.value = null;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function resetPassword(email: string) {
    isLoading.value = true;
    error.value = null;

    try {
      await userService.sendPasswordReset(email);
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProfile(data: { name?: string }) {
    if (!userId.value) throw new Error('No authenticated user');

    isLoading.value = true;
    error.value = null;

    try {
      const updatedProfile = await userService.updateUserProfile(userId.value, data);
      userProfile.value = updatedProfile;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    firebaseUser,
    userProfile,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userId,
    userEmail,

    // Actions
    initialize,
    login,
    register,
    logout,
    resetPassword,
    updateProfile
  };
});
