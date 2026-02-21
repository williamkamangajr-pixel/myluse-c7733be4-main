import { useState, useEffect } from 'react';
import { PremiumLayout } from '@/components/layout';
import { User, Wallet, MapPin, Mail, Phone, CreditCard, Building, Bell, Lock, Save, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PasskeyRegistration } from '@/components/auth/PasskeyRegistration';
import { getBrokers } from '@/lib/brokerData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileData {
  portfolioName: string;
  fullName: string;
  address: string;
  email: string;
  csdNumber: string;
  mobileMoneyProvider: string;
  mobileMoneyNumber: string;
  selectedBrokerId: string;
  notificationsEnabled: boolean;
  notifyPriceChanges: boolean;
  notifyTrades: boolean;
}

const ProfilePage = () => {
  const { user, signOut, setPasscode, hasPasscode } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
  const [newPasscode, setNewPasscode] = useState(['', '', '', '']);
  const [confirmPasscode, setConfirmPasscode] = useState(['', '', '', '']);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [formData, setFormData] = useState<ProfileData>({
    portfolioName: 'My Portfolio',
    fullName: '',
    address: '',
    email: user?.email || '',
    csdNumber: '',
    mobileMoneyProvider: '',
    mobileMoneyNumber: '',
    selectedBrokerId: 'stockbrokers-zambia',
    notificationsEnabled: true,
    notifyPriceChanges: true,
    notifyTrades: true,
  });

  // Track locked fields (set on signup and cannot be changed)
  const [lockedFields, setLockedFields] = useState({
    fullName: false,
    csdNumber: false,
    selectedBrokerId: false,
  });

  const brokers = getBrokers();

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('session_id', user.id)
      .maybeSingle();

    if (data) {
      const prefs = (data.notification_preferences as any) || {};
      const loadedData = {
        portfolioName: prefs.portfolioName || 'My Portfolio',
        fullName: data.full_name || '',
        address: prefs.address || '',
        email: data.email || user.email || '',
        csdNumber: prefs.csdNumber || '',
        mobileMoneyProvider: data.mobile_money_provider || '',
        mobileMoneyNumber: data.mobile_money_number || '',
        selectedBrokerId: data.selected_broker_id || 'stockbrokers-zambia',
        notificationsEnabled: prefs.enabled ?? true,
        notifyPriceChanges: prefs.priceChanges ?? true,
        notifyTrades: prefs.trades ?? true,
      };
      
      setFormData(loadedData);
      
      // Lock fields that were set during signup (non-empty values)
      setLockedFields({
        fullName: !!data.full_name,
        csdNumber: !!prefs.csdNumber,
        selectedBrokerId: !!data.selected_broker_id,
      });
    }
    
    setIsInitialLoad(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        session_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        mobile_money_provider: formData.mobileMoneyProvider,
        mobile_money_number: formData.mobileMoneyNumber,
        selected_broker_id: formData.selectedBrokerId,
        notification_preferences: {
          enabled: formData.notificationsEnabled,
          priceChanges: formData.notifyPriceChanges,
          trades: formData.notifyTrades,
          portfolioName: formData.portfolioName,
          csdNumber: formData.csdNumber,
          address: formData.address,
        },
      });

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile saved successfully');
    }

    setIsSaving(false);
  };

  const handlePasscodeChange = (index: number, value: string, isConfirm = false) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const setter = isConfirm ? setConfirmPasscode : setNewPasscode;
    const current = isConfirm ? confirmPasscode : newPasscode;
    const newArr = [...current];
    newArr[index] = value;
    setter(newArr);

    if (value && index < 3) {
      const nextId = isConfirm ? `confirm-passcode-${index + 1}` : `new-passcode-${index + 1}`;
      document.getElementById(nextId)?.focus();
    }
  };

  const handleSetPasscode = async () => {
    const code = newPasscode.join('');
    const confirm = confirmPasscode.join('');

    if (code.length !== 4) {
      toast.error('Please enter a 4-digit passcode');
      return;
    }

    if (code !== confirm) {
      toast.error('Passcodes do not match');
      return;
    }

    const { error } = await setPasscode(code);
    if (error) {
      toast.error('Failed to set passcode');
    } else {
      toast.success('Passcode updated');
      setShowPasscodeDialog(false);
      setNewPasscode(['', '', '', '']);
      setConfirmPasscode(['', '', '', '']);
    }
  };

  const selectedBroker = brokers.find(b => b.id === formData.selectedBrokerId);

  return (
    <PremiumLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">My Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account settings</p>
          </div>
        </div>

        {/* Account Holder Info */}
        <section className="premium-card space-y-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Account Holder</h2>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-medium">{formData.fullName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CSD Number</span>
              <span className="font-medium">{formData.csdNumber || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Broker</span>
              <span className="font-medium">{selectedBroker?.name || '—'}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border/30 pt-2">
            These details were set during signup and cannot be changed.
          </p>
        </section>

        {/* Portfolio Name */}
        <section className="premium-card space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Portfolio Name</h2>
          </div>
          <p className="text-sm text-muted-foreground">Customize your portfolio display name</p>
          <Input
            value={formData.portfolioName}
            onChange={(e) => setFormData(prev => ({ ...prev, portfolioName: e.target.value }))}
            className="bg-background/50"
          />
        </section>

        {/* Address */}
        <section className="premium-card space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Address</h2>
          </div>
          <Input
            placeholder="Enter your address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="bg-background/50"
          />
        </section>

        {/* Mobile Money */}
        <section className="premium-card space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Mobile Money</h2>
          </div>
          <p className="text-sm text-muted-foreground">Payment details for deposits and withdrawals</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <RadioGroup
                value={formData.mobileMoneyProvider}
                onValueChange={(value) => setFormData(prev => ({ ...prev, mobileMoneyProvider: value }))}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mtn" id="mtn" />
                  <Label htmlFor="mtn" className="cursor-pointer">MTN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="airtel" id="airtel" />
                  <Label htmlFor="airtel" className="cursor-pointer">Airtel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zamtel" id="zamtel" />
                  <Label htmlFor="zamtel" className="cursor-pointer">Zamtel</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.mobileMoneyNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, mobileMoneyNumber: e.target.value }))}
                placeholder="+260971234567"
                className="bg-background/50"
              />
            </div>
          </div>
        </section>

        {/* Quick Access Passcode */}
        <section className="premium-card space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Quick Access Passcode</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {hasPasscode 
              ? 'Your passcode is set. Change it anytime below.' 
              : 'Set up a 4-digit passcode for quick sign-in'}
          </p>

          {!showPasscodeDialog ? (
            <Button
              variant="outline"
              onClick={() => setShowPasscodeDialog(true)}
              className="w-full"
            >
              {hasPasscode ? 'Change Passcode' : 'Set Passcode'}
            </Button>
          ) : (
            <div className="space-y-4 rounded-lg border border-border/50 bg-muted/20 p-4">
              <div>
                <Label className="text-xs">New Passcode</Label>
                <div className="mt-2 flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <Input
                      key={index}
                      id={`new-passcode-${index}`}
                      type="password"
                      maxLength={1}
                      value={newPasscode[index]}
                      onChange={(e) => handlePasscodeChange(index, e.target.value)}
                      className="h-12 w-12 text-center text-xl bg-background"
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">Confirm Passcode</Label>
                <div className="mt-2 flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <Input
                      key={index}
                      id={`confirm-passcode-${index}`}
                      type="password"
                      maxLength={1}
                      value={confirmPasscode[index]}
                      onChange={(e) => handlePasscodeChange(index, e.target.value, true)}
                      className="h-12 w-12 text-center text-xl bg-background"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasscodeDialog(false);
                    setNewPasscode(['', '', '', '']);
                    setConfirmPasscode(['', '', '', '']);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSetPasscode} className="flex-1">
                  Save Passcode
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Biometric Passkeys */}
        <section className="premium-card">
          <PasskeyRegistration />
        </section>

        {/* Notifications */}
        <section className="premium-card space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <p className="text-sm text-muted-foreground">Configure your notification preferences</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">Receive all notifications</p>
              </div>
              <Switch
                checked={formData.notificationsEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notificationsEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Price Changes</p>
                <p className="text-sm text-muted-foreground">Alert on significant price moves</p>
              </div>
              <Switch
                checked={formData.notifyPriceChanges}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifyPriceChanges: checked }))}
                disabled={!formData.notificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Trade Confirmations</p>
                <p className="text-sm text-muted-foreground">Notify when trades are initiated</p>
              </div>
              <Switch
                checked={formData.notifyTrades}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifyTrades: checked }))}
                disabled={!formData.notificationsEnabled}
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full gap-2"
          size="lg"
        >
          {isSaving ? (
            <div className="processing-spinner h-5 w-5" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>

        {/* Sign Out */}
        <Button
          variant="outline"
          onClick={signOut}
          className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </PremiumLayout>
  );
};

export default ProfilePage;
