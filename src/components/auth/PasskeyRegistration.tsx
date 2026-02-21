import { useState, useEffect } from 'react';
import { Fingerprint, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser';

interface Passkey {
  id: string;
  device_type: string | null;
  created_at: string;
  last_used_at: string | null;
}

export function PasskeyRegistration() {
  const { user } = useAuth();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn());
    if (user) {
      fetchPasskeys();
    }
  }, [user]);

  const fetchPasskeys = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_passkeys')
      .select('id, device_type, created_at, last_used_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPasskeys(data);
    }
  };

  const registerPasskey = async () => {
    if (!user) {
      toast.error('You must be signed in to register a passkey');
      return;
    }

    setIsRegistering(true);

    try {
      // Generate challenge and options (in production, this should come from your server)
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const challengeBase64 = btoa(String.fromCharCode(...challenge));

      const registrationOptions = {
        challenge: challengeBase64,
        rp: {
          name: 'MyLuSE',
          id: window.location.hostname,
        },
        user: {
          id: btoa(user.id),
          name: user.email || 'User',
          displayName: user.user_metadata?.full_name || user.email || 'User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' as const }, // ES256
          { alg: -257, type: 'public-key' as const }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform' as const, // Prefer platform authenticators (biometrics)
          residentKey: 'preferred' as const,
          userVerification: 'required' as const,
        },
        timeout: 60000,
        attestation: 'none' as const,
      };

      const credential = await startRegistration({ optionsJSON: registrationOptions });

      // Store the credential in Supabase
      const { error } = await supabase.from('user_passkeys').insert({
        user_id: user.id,
        credential_id: credential.id,
        public_key: JSON.stringify(credential.response),
        counter: 0,
        device_type: getDeviceType(),
        backed_up: credential.clientExtensionResults?.credProps?.rk || false,
        transports: credential.response.transports || [],
      });

      if (error) {
        throw error;
      }

      toast.success('Passkey registered successfully!');
      fetchPasskeys();
    } catch (error: any) {
      console.error('Passkey registration error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Passkey registration was cancelled');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Your device does not support passkeys');
      } else {
        toast.error(error.message || 'Failed to register passkey');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const deletePasskey = async (id: string) => {
    const { error } = await supabase
      .from('user_passkeys')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove passkey');
    } else {
      toast.success('Passkey removed');
      setPasskeys(passkeys.filter(p => p.id !== id));
    }
  };

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Mac/.test(ua)) return 'Mac';
    if (/Windows/.test(ua)) return 'Windows';
    return 'Unknown';
  };

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <X className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium">Passkeys not supported</p>
            <p className="text-sm">Your browser or device doesn't support biometric passkeys.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fingerprint className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium">Biometric Passkeys</h3>
            <p className="text-sm text-muted-foreground">
              Use fingerprint or face recognition for quick sign-in
            </p>
          </div>
        </div>
        <Button
          onClick={registerPasskey}
          disabled={isRegistering}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isRegistering ? (
            <div className="processing-spinner h-4 w-4" />
          ) : (
            <Fingerprint className="h-4 w-4" />
          )}
          Add Passkey
        </Button>
      </div>

      {passkeys.length > 0 && (
        <div className="space-y-2">
          {passkeys.map((passkey) => (
            <div
              key={passkey.id}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{passkey.device_type || 'Device'}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(passkey.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deletePasskey(passkey.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {passkeys.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No passkeys registered yet. Add one for faster sign-in.
        </p>
      )}
    </div>
  );
}
