import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  TrendingUp, 
  ArrowLeftRight, 
  Wallet, 
  Bell, 
  ChevronRight, 
  ChevronLeft, 
  X,
  BarChart3,
  Star,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to MyLuSE",
    description: "Your gateway to trading on the Lusaka Securities Exchange. Let's take a quick tour of the key features to help you get started.",
    icon: <Home className="h-12 w-12" />,
    tip: "This guide will only take about 2 minutes"
  },
  {
    title: "Browse Stocks",
    description: "Explore all listed companies on the LuSE. View real-time prices, market data, and company information to make informed investment decisions.",
    icon: <TrendingUp className="h-12 w-12" />,
    tip: "Tap on any stock to see detailed charts and financials"
  },
  {
    title: "Place Trades",
    description: "Buy and sell shares easily through our streamlined trading interface. Select your stock, enter quantity, and confirm your order with transparent fee breakdowns.",
    icon: <ArrowLeftRight className="h-12 w-12" />,
    tip: "All trades are processed through your selected broker"
  },
  {
    title: "Manage Your Wallet",
    description: "Fund your trading wallet via Mobile Money or bank transfer. Track your balance, deposits, and withdrawals all in one place.",
    icon: <Wallet className="h-12 w-12" />,
    tip: "Top up your wallet before placing buy orders"
  },
  {
    title: "Track Your Portfolio",
    description: "Monitor your investments with real-time valuations, performance charts, and dividend tracking. See your gains and losses at a glance.",
    icon: <BarChart3 className="h-12 w-12" />,
    tip: "Check your portfolio daily to stay on top of market movements"
  },
  {
    title: "Create Watchlists",
    description: "Save stocks you're interested in to your personal watchlist. Get quick access to price updates and market movements for your favorite securities.",
    icon: <Star className="h-12 w-12" />,
    tip: "Add stocks to your watchlist by tapping the star icon"
  },
  {
    title: "Stay Notified",
    description: "Receive alerts for price changes, trade executions, and important market updates. Never miss an opportunity or key event.",
    icon: <Bell className="h-12 w-12" />,
    tip: "Enable push notifications in your profile settings"
  },
  {
    title: "Security First",
    description: "Your account is protected with a 4-digit passcode and automatic session lock. We take your financial security seriously.",
    icon: <Shield className="h-12 w-12" />,
    tip: "The app locks automatically after 2 minutes of inactivity"
  },
  {
    title: "You're All Set!",
    description: "You're ready to start your investment journey on the LuSE. Explore the app, browse stocks, and when you're ready, place your first trade!",
    icon: <TrendingUp className="h-12 w-12" />,
    tip: "Happy investing! 🎉"
  }
];

interface OnboardingGuideProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingGuide({ open, onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md p-0 gap-0 overflow-hidden border-primary/20"
        hideCloseButton
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header with step counter and skip */}
        <div className="flex items-center justify-between px-6 pt-4">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {onboardingSteps.length}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground -mr-2"
          >
            <X className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon with glow effect */}
            <div className={cn(
              "p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5",
              "text-primary animate-pulse"
            )}>
              {step.icon}
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold tracking-tight">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {/* Tip card */}
            {step.tip && (
              <Card className="w-full bg-primary/5 border-primary/10">
                <CardContent className="p-3">
                  <p className="text-sm text-primary/90 font-medium">
                    💡 {step.tip}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-4">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === currentStep 
                  ? "w-6 bg-primary" 
                  : index < currentStep 
                    ? "w-1.5 bg-primary/50" 
                    : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 p-6 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isLastStep ? "Get Started" : "Next"}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
