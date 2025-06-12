import { ref } from 'vue';
import { CampaignService } from '@/services/campaign.service';
import type { Campaign } from '@/db/database.types';
import type { CreateCampaignData, UpdateCampaignData } from '@/services/types';
import { useAuthStore } from '@/stores/auth';

export function useCampaign() {
  const campaignService = new CampaignService();
  const authStore = useAuthStore();

  const campaigns = ref<Campaign[]>([]);
  const currentCampaign = ref<Campaign | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchUserCampaigns() {
    if (!authStore.userId) {
      throw new Error('User not authenticated');
    }

    isLoading.value = true;
    error.value = null;

    try {
      campaigns.value = await campaignService.getUserCampaigns(authStore.userId);
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function getCampaign(uuid: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const campaign = await campaignService.getCampaign(uuid);
      if (campaign) {
        currentCampaign.value = campaign;
      }
      return campaign;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function createCampaign(data: CreateCampaignData) {
    if (!authStore.userId) {
      throw new Error('User not authenticated');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const campaign = await campaignService.createCampaign(data, authStore.userId);
      campaigns.value.push(campaign);
      return campaign;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCampaign(uuid: string, data: UpdateCampaignData) {
    if (!authStore.userId) {
      throw new Error('User not authenticated');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const updatedCampaign = await campaignService.updateCampaign(uuid, data, authStore.userId);
      const index = campaigns.value.findIndex(c => c.uuid === uuid);
      if (index !== -1) {
        campaigns.value[index] = updatedCampaign;
      }
      if (currentCampaign.value?.uuid === uuid) {
        currentCampaign.value = updatedCampaign;
      }
      return updatedCampaign;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    campaigns,
    currentCampaign,
    isLoading,
    error,

    // Methods
    fetchUserCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign
  };
}
