import { useState, useEffect } from 'react';
import { Lock, LogOut, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import myluseLogo from '@/assets/myluse-logo.png';
import { startAuthentication } from '@simplewebauthn/browser';
import { supabase } from '@/integrations/supabase/client';

export function PasscodeLock() {
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const { unlockWithPasscode, unlockSession, user } = useAuth();

  // Check if user has registered passkeys
  useEffect(() => {
    const checkPasskeys = async () => {
      const userId = user?.id || localStorage.getItem('relogin_session_id');
      if (!userId) return;
      
      const { data } = await supabase
        .from('user_passkeys')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      setHasPasskey(data && data.length > 0);
    };
    
    checkPasskeys();
  }, [user]);

  const handlePasscodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newPasscode = [...passcode];
    newPasscode[index] = value;
    setPasscode(newPasscode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`lock-passcode-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when complete
    if (index === 3 && value) {
      const fullPasscode = [...newPasscode.slice(0, 3), value].join('');
      if (fullPasscode.length === 4) {
        handleUnlock(fullPasscode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      const prevInput = document.getElementById(`lock-passcode-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleUnlock = async (code?: string) => {
    const passcodeToVerify = code || passcode.join('');
    if (passcodeToVerify.length !== 4) return;

    setIsVerifying(true);
    
    try {
      const success = await unlockWithPasscode(passcodeToVerify);
      if (success) {
        toast.success('Welcome back!');
      } else {
        toast.error('Incorrect passcode');
        setPasscode(['', '', '', '']);
        document.getElementById('lock-passcode-0')?.focus();
      }
    } catch (err) {
      console.error('Passcode verification error:', err);
      toast.error('Verification failed');
      setPasscode(['', '', '', '']);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBiometricUnlock = async () => {
    const userId = user?.id || localStorage.getItem('relogin_session_id');
    if (!userId) return;
    
    setIsVerifying(true);
    try {
      // Fetch user's passkeys
      const { data: passkeys, error: fetchError } = await supabase
        .from('user_passkeys')
        .select('credential_id, public_key, transports')
        .eq('user_id', userId);
      
      if (fetchError || !passkeys?.length) {
        toast.error('No passkeys registered');
        return;
      }

      // Generate a simple challenge for local verification
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const challengeBase64 = btoa(String.fromCharCode(...challenge));

      // Prepare allowed credentials
      const allowCredentials = passkeys.map(pk => ({
        id: pk.credential_id,
        type: 'public-key' as const,
        transports: pk.transports as AuthenticatorTransport[] || ['internal'],
      }));

      const authenticationOptions = {
        challenge: challengeBase64,
        timeout: 60000,
        userVerification: 'preferred' as const,
        rpId: window.location.hostname,
        allowCredentials,
      };

      // Start authentication
      const authResponse = await startAuthentication({ optionsJSON: authenticationOptions });
      
      // If we got a response, the biometric check passed
      if (authResponse) {
        // Update last used timestamp
        await supabase
          .from('user_passkeys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('credential_id', authResponse.id);
        
        unlockSession();
        toast.success('Unlocked with biometrics');
      }
    } catch (error: unknown) {
      console.error('Biometric authentication failed:', error);
      const err = error as { name?: string };
      if (err.name === 'NotAllowedError') {
        toast.error('Biometric authentication cancelled');
      } else {
        toast.error('Biometric authentication failed');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear all localStorage
      localStorage.removeItem('relogin_session_id');
      localStorage.removeItem('myluse_last_activity');
      localStorage.removeItem('money_acumen_session_id');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Force redirect
      window.location.href = "/auth"; 
      
      toast.success("Signed out successfully");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Error signing out: " + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-8 text-center">
        {/* Logo with glow effect */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4">
            <img src={myluseLogo} alt="MyLuSE" className="h-20 w-20 relative z-10" />
            <div className="absolute inset-0 logo-glow rounded-full" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Session Locked</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your passcode to continue
          </p>
        </div>

        {/* Biometric Option */}
        {hasPasskey && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBiometricUnlock}
              disabled={isVerifying}
              className="w-full gap-2 h-14 text-base"
            >
              <Fingerprint className="h-6 w-6" />
              Unlock with Biometrics
            </Button>
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or enter passcode</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </div>
        )}

        {/* Passcode Input */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-1 mb-4">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Enter 4-digit passcode</span>
          </div>
          <div className="flex justify-center gap-4">
            {[0, 1, 2, 3].map((index) => (
              <Input
                key={index}
                id={`lock-passcode-${index}`}
                type="password"
                maxLength={1}
                value={passcode[index]}
                onChange={(e) => handlePasscodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isVerifying}
                autoFocus={index === 0 && !hasPasskey}
                className="h-14 w-14 text-center text-2xl bg-card border-border/50"
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => handleUnlock()}
            disabled={passcode.join('').length !== 4 || isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <div className="processing-spinner h-5 w-5" />
            ) : (
              'Unlock'
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out instead
          </Button>
        </div>
      </div>
    </div>
  );
}
