import { PremiumLayout } from '@/components/layout';
import {
  WalletCard,
  MarketOverviewCard,
  TopMoversSection,
  PortfolioPreviewCard,
} from '@/components/dashboard';
import { useStocks } from '@/hooks/useStocks';
import { useRealtimeStocks } from '@/hooks/useRealtimeSubscriptions';
import { getTopGainers, getTopLosers, getMostActive } from '@/lib/mockData';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { useOnboarding } from '@/hooks/useOnboarding';

const Index = () => {
  const { stocks, marketSummary, isLoading, isFetching } = useStocks();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Enable real-time updates
  useRealtimeStocks();

  const topGainers = getTopGainers(stocks, 5);
  const topLosers = getTopLosers(stocks, 5);
  const mostActive = getMostActive(stocks, 5);

  if (isLoading) {
    return (
      <PremiumLayout>
        <LoadingFallback type="page" />
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      {/* Onboarding Guide for new users */}
      <OnboardingGuide open={showOnboarding} onComplete={completeOnboarding} />

      <div className="space-y-4 stagger-children">
        {/* Wallet Card */}
        <div className="animate-fade-in">
          <WalletCard />
        </div>

        {/* LuSE All Share Index - Auto-updated */}
        <div className="animate-fade-in">
          <MarketOverviewCard 
            summary={marketSummary}
            isLoading={isFetching}
            lastUpdated={marketSummary.lastUpdated}
          />
        </div>

        {/* Two Column Grid on Desktop */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Movers */}
          <div className="animate-fade-in">
            <TopMoversSection
              gainers={topGainers}
              losers={topLosers}
              active={mostActive}
            />
          </div>

          {/* Portfolio Preview */}
          <div className="animate-fade-in">
            <PortfolioPreviewCard />
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default Index;
