import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './useSession';
import { UserProfile } from '@/lib/types';
import { toast } from 'sonner';

const defaultProfile: Omit<UserProfile, 'id' | 'sessionId'> = {
  portfolioName: 'My Portfolio',
  fullName: null,
  email: null,
  mobileMoneyProvider: null,
  mobileMoneyNumber: null,
  selectedBrokerId: 'money-acumen',
  notificationsEnabled: true,
  notifyPriceChanges: true,
  notifyTrades: true,
};

export function useProfile() {
  const { sessionId } = useSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', sessionId],
    queryFn: async (): Promise<UserProfile> => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      if (!data) {
        // Create a default profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            session_id: sessionId,
            full_name: null,
            email: null,
            mobile_money_provider: null,
            mobile_money_number: null,
            selected_broker_id: 'money-acumen',
            notification_preferences: {
              enabled: true,
              priceChanges: true,
              trades: true,
            },
          })
          .select()
          .single();

        if (createError) {
          return {
            id: sessionId,
            sessionId,
            ...defaultProfile,
          };
        }

        return mapProfile(newProfile);
      }

      return mapProfile(data);
    },
    enabled: !!sessionId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: updates.fullName,
          email: updates.email,
          mobile_money_provider: updates.mobileMoneyProvider,
          mobile_money_number: updates.mobileMoneyNumber,
          selected_broker_id: updates.selectedBrokerId,
          notification_preferences: {
            enabled: updates.notificationsEnabled,
            priceChanges: updates.notifyPriceChanges,
            trades: updates.notifyTrades,
            portfolioName: updates.portfolioName,
            csdNumber: updates.csdNumber,
            address: updates.address,
          },
        })
        .eq('session_id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  return {
    profile: profile ?? { id: sessionId, sessionId, ...defaultProfile },
    isLoading,
    error: error?.message,
    refetch,
    updateProfile: updateProfileMutation.mutateAsync,
  };
}

function mapProfile(data: any): UserProfile {
  const prefs = data.notification_preferences || {};
  return {
    id: data.id,
    sessionId: data.session_id,
    portfolioName: prefs.portfolioName || 'My Portfolio',
    fullName: data.full_name,
    address: prefs.address || null,
    email: data.email,
    mobileMoneyProvider: data.mobile_money_provider,
    mobileMoneyNumber: data.mobile_money_number,
    selectedBrokerId: data.selected_broker_id,
    csdNumber: prefs.csdNumber || null,
    notificationsEnabled: prefs.enabled ?? true,
    notifyPriceChanges: prefs.priceChanges ?? true,
    notifyTrades: prefs.trades ?? true,
  };
}
