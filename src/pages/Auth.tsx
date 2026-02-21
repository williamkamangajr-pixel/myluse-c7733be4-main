import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, CreditCard, Building, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getBrokers } from '@/lib/brokerData';
import { PasswordStrengthBar, isStrongPassword } from '@/components/auth/PasswordStrengthBar';
import { toast } from 'sonner';
import myluseLogo from '@/assets/myluse-logo.png';

const PHONE_PREFIX = '+260';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    mobileMoneyProvider: '',
    mobileMoneyNumber: '',
    csdNumber: '',
    brokerId: 'stockbrokers-zambia',
    passcode: ['', '', '', ''],
    confirmPasscode: ['', '', '', ''],
  });
  
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const brokers = getBrokers();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="processing-spinner h-8 w-8" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render auth form if user is already logged in (prevents flash)
  if (user) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMobileNumberChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, mobileMoneyNumber: digitsOnly }));
  };

  const getFullPhoneNumber = () => {
    return `${PHONE_PREFIX}${formData.mobileMoneyNumber}`;
  };

  const isValidPhoneNumber = () => {
    return formData.mobileMoneyNumber.length >= 6;
  };

  const handlePasscodeChange = (index: number, value: string, isConfirm = false) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const field = isConfirm ? 'confirmPasscode' : 'passcode';
    const newPasscode = [...formData[field]];
    newPasscode[index] = value;
    setFormData(prev => ({ ...prev, [field]: newPasscode }));

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`${field}-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error, user: signedInUser } = await signIn(formData.email, formData.password);
    
    if (error) {
      toast.error(error.message || 'Failed to sign in');
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password strength
    if (!isStrongPassword(formData.password)) {
      toast.error('Please use a stronger password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate phone number
    if (!isValidPhoneNumber()) {
      toast.error('Phone number must be at least 6 digits after +260');
      return;
    }

    const passcode = formData.passcode.join('');
    const confirmPasscode = formData.confirmPasscode.join('');
    
    if (passcode.length !== 4) {
      toast.error('Please enter a 4-digit passcode');
      return;
    }

    if (passcode !== confirmPasscode) {
      toast.error('Passcodes do not match');
      return;
    }

    setIsLoading(true);

    const { error, user: createdUser } = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      mobileMoneyProvider: formData.mobileMoneyProvider,
      mobileMoneyNumber: getFullPhoneNumber(),
      csdNumber: formData.csdNumber,
      brokerId: formData.brokerId,
      passcode,
    });

    if (error) {
      toast.error(error.message || 'Failed to create account');
    } else {
      toast.success('Account created! Please check your email to verify.');
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 shadow-xl">
        {/* Logo with glow effect */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-4">
            <img 
              src={myluseLogo} 
              alt="MyLuSE" 
              className="h-16 w-16 relative z-10" 
            />
            <div className="absolute inset-0 logo-glow rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? 'Join MyLuSE to start trading' : 'Sign in to your MyLuSE account'}
          </p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email {isSignUp && '*'}
            </Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="bg-background/50"
            />
          </div>

          {/* Full Name - Sign Up Only */}
          {isSignUp && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name * <span className="text-xs text-muted-foreground">(Account holder name)</span>
              </Label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
          )}

          {/* Password */}
          <div className={isSignUp ? 'space-y-2' : ''}>
            <div className={isSignUp ? 'grid grid-cols-2 gap-4' : ''}>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password {isSignUp && '*'}
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label>Confirm *</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className="bg-background/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Password Strength Bar */}
            {isSignUp && formData.password && (
              <PasswordStrengthBar password={formData.password} />
            )}
          </div>

          {/* Sign Up Fields */}
          {isSignUp && (
            <>
              {/* Mobile Money */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Provider *
                  </Label>
                  <Select
                    value={formData.mobileMoneyProvider}
                    onValueChange={(value) => handleInputChange('mobileMoneyProvider', value)}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mtn">MTN</SelectItem>
                      <SelectItem value="airtel">Airtel</SelectItem>
                      <SelectItem value="zamtel">Zamtel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <div className="flex">
                    <div className="flex items-center justify-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground font-mono">
                      {PHONE_PREFIX}
                    </div>
                    <Input
                      type="tel"
                      placeholder="9712345678"
                      value={formData.mobileMoneyNumber}
                      onChange={(e) => handleMobileNumberChange(e.target.value)}
                      required
                      className="bg-background/50 rounded-l-none font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.mobileMoneyNumber.length} digits entered
                  </p>
                </div>
              </div>

              {/* CSD Number */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  CSD Account Number *
                </Label>
                <Input
                  type="text"
                  placeholder="Your Central Securities Depository number"
                  value={formData.csdNumber}
                  onChange={(e) => handleInputChange('csdNumber', e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              {/* Stock Broker */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Stockbroker *
                </Label>
                <Select
                  value={formData.brokerId}
                  onValueChange={(value) => handleInputChange('brokerId', value)}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select your broker" />
                  </SelectTrigger>
                  <SelectContent>
                    {brokers.map((broker) => (
                      <SelectItem key={broker.id} value={broker.id}>
                        {broker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Passcode */}
              <div className="space-y-4 rounded-lg border border-border/50 bg-muted/20 p-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Quick Access Passcode *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Set a 4-digit passcode for quick sign-in without entering your password
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Enter Passcode</Label>
                    <div className="mt-1 flex justify-center gap-3">
                      {[0, 1, 2, 3].map((index) => (
                        <Input
                          key={index}
                          id={`passcode-${index}`}
                          type="password"
                          maxLength={1}
                          value={formData.passcode[index]}
                          onChange={(e) => handlePasscodeChange(index, e.target.value)}
                          className="h-12 w-12 text-center text-xl bg-background"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Confirm Passcode</Label>
                    <div className="mt-1 flex justify-center gap-3">
                      {[0, 1, 2, 3].map((index) => (
                        <Input
                          key={index}
                          id={`confirmPasscode-${index}`}
                          type="password"
                          maxLength={1}
                          value={formData.confirmPasscode[index]}
                          onChange={(e) => handlePasscodeChange(index, e.target.value, true)}
                          className="h-12 w-12 text-center text-xl bg-background"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Forgot Password - Sign In Only */}
          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => toast.info('Password reset coming soon!')}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full gap-2"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="processing-spinner h-5 w-5" />
            ) : isSignUp ? (
              <>
                <UserPlus className="h-4 w-4" />
                Create Account
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-primary hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
