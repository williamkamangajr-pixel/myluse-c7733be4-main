import { useState } from 'react';
import { X, Smartphone, Download, Eye, EyeOff } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useProfile } from '@/hooks/useProfile';
import { formatZMW } from '@/lib/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WalletTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'deposit' | 'withdraw';
}

const paymentMethods = [
  { id: 'airtel', name: 'Airtel Money', color: 'bg-red-500', shortName: 'Airtel' },
  { id: 'mtn', name: 'MTN Money', color: 'bg-yellow-500', shortName: 'MTN' },
  { id: 'zamtel', name: 'Zamtel Kwacha', color: 'bg-green-500', shortName: 'Zamtel' },
];

const quickAmounts = [100, 500, 1000, 5000];

export function WalletTransactionModal({ open, onOpenChange, type }: WalletTransactionModalProps) {
  const { balance, deposit, withdraw, isDepositing, isWithdrawing } = useWallet();
  const { profile, updateProfile } = useProfile();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState(profile?.mobileMoneyNumber || '');
  const [step, setStep] = useState<'amount' | 'confirm'>('amount');
  const [showBalance, setShowBalance] = useState(false);

  const isProcessing = isDepositing || isWithdrawing;
  const numericAmount = parseFloat(amount) || 0;
  const isValidAmount = numericAmount > 0 && (type === 'deposit' || numericAmount <= balance);
  const isValidMobile = mobileNumber.length >= 10;

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = () => {
    if (!selectedMethod || !isValidAmount || !isValidMobile) return;

    // Save mobile number to profile
    if (mobileNumber !== profile?.mobileMoneyNumber) {
      updateProfile({
        mobileMoneyNumber: mobileNumber,
        mobileMoneyProvider: selectedMethod,
      });
    }

    const action = type === 'deposit' ? deposit : withdraw;
    action(
      { amount: numericAmount, paymentMethod: selectedMethod },
      {
        onSuccess: () => {
          toast.success(
            type === 'deposit' 
              ? `Successfully deposited ${formatZMW(numericAmount)}`
              : `Successfully withdrew ${formatZMW(numericAmount)}`
          );
          onOpenChange(false);
          resetForm();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const resetForm = () => {
    setAmount('');
    setSelectedMethod(null);
    setStep('amount');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </DialogTitle>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-4">
          {step === 'amount' ? (
            <div className="space-y-4">
              {/* Current Balance */}
              {type === 'withdraw' && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Available Balance</p>
                  <p className="number-display text-lg">{formatZMW(balance)}</p>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <Label htmlFor="amount" className="text-sm text-muted-foreground">
                  Amount (ZMW)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5 h-12 text-lg"
                />
              </div>

              {/* Quick Amounts */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleQuickAmount(value)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-sm transition-colors touch-press',
                      amount === value.toString()
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    )}
                  >
                    K{value.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Payment Methods - Compact Tabs */}
              <div>
                <Label className="mb-2 block text-sm text-muted-foreground">
                  Payment Method
                </Label>
                <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-all touch-press',
                        selectedMethod === method.id
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className={cn('h-2 w-2 rounded-full', method.color)} />
                      {method.shortName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Money Number Input */}
              {selectedMethod && (
                <div className="animate-fade-in">
                  <Label htmlFor="mobileNumber" className="text-sm text-muted-foreground">
                    Mobile Money Number
                  </Label>
                  <div className="relative mt-1.5">
                    <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="mobileNumber"
                      type="tel"
                      placeholder="097XXXXXXX"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="h-11 pl-10"
                      maxLength={12}
                    />
                  </div>
                  {mobileNumber && !isValidMobile && (
                    <p className="mt-1 text-xs text-destructive">Enter a valid mobile number</p>
                  )}
                </div>
              )}

              {/* Continue Button */}
              <Button
                className="w-full"
                disabled={!isValidAmount || !selectedMethod || !isValidMobile}
                onClick={() => setStep('confirm')}
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Balance Reveal for Withdraw */}
              {type === 'withdraw' && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-bold number-display',
                        numericAmount <= balance ? 'text-success' : 'text-destructive'
                      )}>
                        {showBalance ? formatZMW(balance) : '••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation */}
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {type === 'deposit' ? 'You are depositing' : 'You are withdrawing'}
                </p>
                <p className="number-display mt-1 text-3xl text-primary">
                  {formatZMW(numericAmount)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  via {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  to {mobileNumber}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep('amount')}
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Transaction History component for exporting
export function TransactionHistoryDownload() {
  const { transactions } = useWallet();
  
  const downloadPDF = () => {
    // Generate CSV for now (PDF would require additional library)
    const headers = ['Date', 'Type', 'Amount', 'Status', 'Method', 'Description'];
    const rows = transactions.map(tx => [
      new Date(tx.createdAt).toLocaleString(),
      tx.type,
      tx.amount.toFixed(2),
      tx.status,
      tx.paymentMethod || '-',
      tx.description || '-'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myluse-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Transaction history downloaded');
  };
  
  return (
    <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-2">
      <Download className="h-4 w-4" />
      Download History
    </Button>
  );
}