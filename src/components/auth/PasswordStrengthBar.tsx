import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthBarProps {
  password: string;
}

function calculateStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  if (score <= 2) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 4) return { score, label: 'Good', color: 'bg-primary' };
  return { score, label: 'Strong', color: 'bg-success' };
}

export function isStrongPassword(password: string): boolean {
  const { score } = calculateStrength(password);
  return score >= 5; // Require "Strong" password
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);
  const segments = 4;
  const filledSegments = Math.min(Math.ceil((strength.score / 6) * segments), segments);
  
  if (!password) return null;
  
  return (
    <div className="space-y-1.5 animate-fade-in">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i < filledSegments ? strength.color : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn(
        'text-xs font-medium',
        strength.label === 'Weak' && 'text-destructive',
        strength.label === 'Fair' && 'text-warning',
        strength.label === 'Good' && 'text-primary',
        strength.label === 'Strong' && 'text-success'
      )}>
        Password strength: {strength.label}
      </p>
      {strength.score < 5 && (
        <p className="text-xs text-muted-foreground">
          Use 12+ characters with uppercase, lowercase, numbers, and symbols
        </p>
      )}
    </div>
  );
}
