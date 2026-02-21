import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_KEY = 'myluse_onboarding_completed';

export function useOnboarding() {
  const { user, isLoading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasChecked = useRef(false);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Reset check state when user changes
    if (!user) {
      hasChecked.current = false;
      setShowOnboarding(false);
      setIsLoading(false);
      return;
    }

    // Don't check while auth is still loading
    if (authLoading) {
      return;
    }

    // Prevent duplicate checks
    if (hasChecked.current || isCheckingRef.current) {
      return;
    }

    const checkOnboardingStatus = async () => {
      isCheckingRef.current = true;
      
      try {
        // Check localStorage first for immediate response (prevents flicker)
        const localKey = `${ONBOARDING_KEY}_${user.id}`;
        const localCompleted = localStorage.getItem(localKey);
        
        if (localCompleted === 'true') {
          hasChecked.current = true;
          setShowOnboarding(false);
          setIsLoading(false);
          isCheckingRef.current = false;
          return;
        }

        // Check user profile for onboarding_completed flag
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('notification_preferences')
          .eq('session_id', user.id)
          .maybeSingle();

        const prefs = profile?.notification_preferences as Record<string, unknown> | null;
        const hasCompletedOnboarding = prefs?.onboarding_completed === true;

        if (hasCompletedOnboarding) {
          // User has completed onboarding before - store locally and don't show
          localStorage.setItem(localKey, 'true');
          setShowOnboarding(false);
        } else {
          // New user - show onboarding only after everything is loaded
          setShowOnboarding(true);
        }
        
        hasChecked.current = true;
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, don't show onboarding to avoid confusion
        setShowOnboarding(false);
      } finally {
        setIsLoading(false);
        isCheckingRef.current = false;
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;

    try {
      const localKey = `${ONBOARDING_KEY}_${user.id}`;
      
      // Immediately hide and store locally
      setShowOnboarding(false);
      localStorage.setItem(localKey, 'true');

      // Update user profile to mark onboarding as completed
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('notification_preferences')
        .eq('session_id', user.id)
        .maybeSingle();

      const currentPrefs = (profile?.notification_preferences as Record<string, unknown>) || {};
      
      await supabase
        .from('user_profiles')
        .update({
          notification_preferences: {
            ...currentPrefs,
            onboarding_completed: true
          }
        })
        .eq('session_id', user.id);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [user]);

  return {
    showOnboarding: !isLoading && !authLoading && showOnboarding,
    isLoading: isLoading || authLoading,
    completeOnboarding
  };
}
