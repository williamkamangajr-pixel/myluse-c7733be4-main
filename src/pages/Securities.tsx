import { PremiumLayout } from '@/components/layout';
import { Landmark, Clock, Sparkles } from 'lucide-react';

const SecuritiesPage = () => {
  return (
    <PremiumLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="coming-soon-card w-full max-w-md text-center">
          {/* Glowing Icon */}
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/40">
              <Landmark className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Fixed Income Securities
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-muted-foreground mb-6">
            Bonds & Treasury Bills
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Coming Soon</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            We're working hard to bring you access to government bonds and treasury bills. Stay tuned for updates!
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Government Bonds</span>
              </div>
              <p className="text-2xs text-muted-foreground">Long-term fixed income</p>
            </div>
            <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Treasury Bills</span>
              </div>
              <p className="text-2xs text-muted-foreground">Short-term securities</p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
          <div className="absolute bottom-4 left-4 h-2 w-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </PremiumLayout>
  );
};

export default SecuritiesPage;
