import { ReactNode } from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNavBar } from './MobileNavBar';
import { MobileHeader } from './MobileHeader';

interface PremiumLayoutProps {
  children: ReactNode;
  title?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function PremiumLayout({ children, onRefresh, isRefreshing }: PremiumLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Copper glow effect at top */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 gradient-copper-glow" />
      
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Header */}
      <MobileHeader onRefresh={onRefresh} isRefreshing={isRefreshing} />

      {/* Main Content */}
      <main className="relative lg:ml-[200px]">
        <div className="mx-auto max-w-6xl px-4 py-4 pb-24 lg:pb-8 lg:pt-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNavBar />
    </div>
  );
}
