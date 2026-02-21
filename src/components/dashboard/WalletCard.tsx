import { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useProfile } from '@/hooks/useProfile';
import { formatZMW } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { WalletTransactionModal, TransactionHistoryDownload } from './WalletTransactionModal';
import myluseLogo from '@/assets/myluse-logo.png';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function WalletCard() {
  const { balance, transactions, isLoading } = useWallet();
  const { profile } = useProfile();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw' | null>(null);

  const csdAccountNumber = profile?.csdNumber || '2026 0000 0000';
  const accountHolder = profile?.fullName || 'Account Holder';
  const transactionCount = transactions?.length || 0;

  return (
    <>
      <div className="premium-card p-0 overflow-hidden">
        {/* Premium Zambian Themed Card */}
        <div className="zambian-premium-card relative">
          {/* Content */}
          <div className="relative z-10">
            {/* Header with Logo and Eye Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img 
                  src={myluseLogo} 
                  alt="MyLuSE" 
                  className="h-8 w-auto object-contain"
                />
                <span className="text-sm font-medium text-white/90">MyLuSE</span>
              </div>
              <button
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white touch-press"
                aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
              >
                {isBalanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>

            {/* CSD Account Number */}
            <div className="mb-3">
              <p className="text-2xs text-white/60 uppercase tracking-wide">CSD Account Number</p>
              <p className="font-mono text-sm font-medium tracking-widest text-white/90">
                {isBalanceVisible ? csdAccountNumber : '•••• •••• ••••'}
              </p>
            </div>

            {/* Available Balance */}
            <div className="mb-3">
              <p className="text-2xs text-white/60 uppercase tracking-wide">Available Balance</p>
              {isLoading ? (
                <div className="h-10 w-40 animate-pulse rounded bg-white/20" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="number-display text-3xl font-bold text-white">
                    {isBalanceVisible ? formatZMW(balance) : '••••••'}
                  </p>
                  <span className="text-sm text-white/70">ZMW</span>
                </div>
              )}
            </div>

            {/* Account Holder */}
            <div>
              <p className="text-2xs text-white/60 uppercase tracking-wide">Account Holder</p>
              <p className="text-sm font-semibold text-white/90 uppercase">
                {isBalanceVisible ? accountHolder : '••••••••••'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 p-4 pt-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setTransactionType('deposit')}
            className="gap-2 border-success/30 text-success hover:bg-success/10 hover:text-success hover:border-success/50 glow-hover"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Deposit
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setTransactionType('withdraw')}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50 glow-hover"
          >
            <ArrowUpRight className="h-4 w-4" />
            Withdraw
          </Button>
        </div>

        {/* Transaction History Link */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex w-full items-center justify-center gap-2 border-t border-border/30 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <Clock className="h-4 w-4" />
              <span>Transaction History</span>
              {transactionCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium">
                  {transactionCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader className="flex-row items-center justify-between">
              <SheetTitle>Transaction History</SheetTitle>
              {transactions.length > 0 && <TransactionHistoryDownload />}
            </SheetHeader>
            <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(70vh-100px)]">
              {transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No transactions yet</p>
                  <p className="text-sm text-muted-foreground">Your transactions will appear here</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        tx.type === 'deposit' ? 'bg-success/10' : 'bg-primary/10'
                      )}>
                        {tx.type === 'deposit' ? (
                          <ArrowDownLeft className="h-5 w-5 text-success" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()} • {tx.paymentMethod || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-semibold number-display',
                        tx.type === 'deposit' ? 'text-success' : 'text-foreground'
                      )}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatZMW(tx.amount)}
                      </p>
                      <p className={cn(
                        'text-xs capitalize',
                        tx.status === 'completed' ? 'text-success' : 'text-muted-foreground'
                      )}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Transaction Modal */}
      <WalletTransactionModal
        open={transactionType !== null}
        onOpenChange={(open) => !open && setTransactionType(null)}
        type={transactionType || 'deposit'}
      />
    </>
  );
}
