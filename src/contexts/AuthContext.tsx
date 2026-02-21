import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isLocked: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; user?: User | null }>;
  signUp: (data: SignUpData) => Promise<{ error: Error | null; user?: User | null }>;
  signOut: () => Promise<void>;
  unlockWithPasscode: (passcode: string) => Promise<boolean>;
  unlockSession: () => void;
  setPasscode: (passcode: string) => Promise<{ error: Error | null }>;
  hasPasscode: boolean;
  lockApp: () => void;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  mobileMoneyProvider: string;
  mobileMoneyNumber: string;
  csdNumber: string;
  brokerId: string;
  passcode: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute
const LAST_ACTIVITY_KEY = 'myluse_last_activity';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [hasPasscode, setHasPasscode] = useState(false);

  const checkPasscode = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    // Type-safe access using any cast for flexibility
    const profile = data as Record<string, unknown> | null;
    setHasPasscode(!!profile?.passcode);
  }, []);

  const checkInactivity = useCallback(() => {
    if (!user) return;
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > INACTIVITY_TIMEOUT && hasPasscode) {
        setIsLocked(true);
      }
    }
  }, [user, hasPasscode]);

  const updateActivity = useCallback(() => {
    if (user && !isLocked) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }, [user, isLocked]);

  // Visibility change handler - Lock on minimize/tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && user && hasPasscode) {
        console.log('App minimized/hidden - locking session');
        setIsLocked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, hasPasscode]);

  // User activity tracking
  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    const interval = setInterval(checkInactivity, 5000);
    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, [user, updateActivity, checkInactivity]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Save user ID for relogin
          localStorage.setItem('relogin_session_id', session.user.id);
          checkPasscode(session.user.id);
        } else {
          setHasPasscode(false);
          setIsLocked(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.setItem('relogin_session_id', session.user.id);
        checkPasscode(session.user.id);
        checkInactivity();
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkPasscode, checkInactivity]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      localStorage.setItem('relogin_session_id', data.user.id);
      updateActivity();
      setIsLocked(false);
    }
    return { error: error as Error | null, user: data?.user ?? null };
  };

  const signUp = async (signUpData: SignUpData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        data: { full_name: signUpData.fullName }
      }
    });

    if (authError) return { error: authError as Error, user: null };

    if (authData.user) {
      // Create user profile with passcode
      const { error: profileError } = await supabase.from('user_profiles').upsert({
        id: authData.user.id,
        session_id: authData.user.id,
        full_name: signUpData.fullName,
        email: signUpData.email,
        mobile_money_provider: signUpData.mobileMoneyProvider,
        mobile_money_number: signUpData.mobileMoneyNumber,
        selected_broker_id: signUpData.brokerId,
        csd_number: signUpData.csdNumber,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Store passcode separately using raw update to bypass type checking
      await supabase
        .from('user_profiles')
        .update({ passcode: signUpData.passcode } as Record<string, unknown>)
        .eq('id', authData.user.id);

      // Create wallet with 0 balance for new users
      await supabase.from('wallets').insert({
        session_id: authData.user.id,
        balance: 0,
        currency: 'ZMW',
      });

      localStorage.setItem('relogin_session_id', authData.user.id);
      updateActivity();
    }
    return { error: null, user: authData.user ?? null };
  };

  const signOut = async () => {
    try {
      // Clear all localStorage data
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      localStorage.removeItem('relogin_session_id');
      localStorage.removeItem('money_acumen_session_id');
      
      setIsLocked(false);
      setUser(null);
      setSession(null);
      setHasPasscode(false);
      
      await supabase.auth.signOut();
      window.location.href = "/auth";
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/auth";
    }
  };

  const unlockWithPasscode = async (passcode: string) => {
    const storedUserId = localStorage.getItem('relogin_session_id');
    const effectiveUserId = user?.id || storedUserId;

    if (!effectiveUserId) {
      console.error("No ID found to unlock");
      return false;
    }

    // Query with select('*') and cast to bypass type checking
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', effectiveUserId)
      .maybeSingle();

    if (error) {
      console.error("Database check failed:", error.message);
      return false;
    }

    // Type-safe access
    const profile = data as Record<string, unknown> | null;
    if (profile && profile.passcode === passcode) {
      setIsLocked(false);
      updateActivity();
      return true;
    }
    
    return false;
  };

  const setPasscodeValue = async (passcode: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ passcode } as Record<string, unknown>)
      .eq('id', user.id);

    if (!error) setHasPasscode(true);
    return { error: error as Error | null };
  };

  const lockApp = () => {
    if (hasPasscode) setIsLocked(true);
  };

  const unlockSession = () => {
    setIsLocked(false);
    updateActivity();
  };

  return (
    <AuthContext.Provider value={{
      user, session, isLoading, isLocked, signIn, signUp, signOut,
      unlockWithPasscode, unlockSession, setPasscode: setPasscodeValue, hasPasscode, lockApp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
