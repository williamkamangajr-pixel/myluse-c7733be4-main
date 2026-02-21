import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, TrendingUp, Gavel, ShoppingCart, User, Building2, Wallet, AlertTriangle } from 'lucide-react';
import { MarketplaceListing, useMarketplace, calculatePPT } from '@/hooks/useMarketplace';
import { formatZMW } from '@/lib/mockData';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';

interface MarketplaceListingsProps {
  listings: MarketplaceListing[];
  isLoading: boolean;
}

export function MarketplaceListings({ listings, isLoading }: MarketplaceListingsProps) {
  const { user } = useAuth();
  const { buyAtFixedPrice, submitOffer } = useMarketplace();
  const { balance } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState(0);
  const [offerQuantity, setOfferQuantity] = useState(1);

  // Calculate total cost for current selection
  const getTotalCost = () => {
    if (!selectedListing?.asking_price) return 0;
    const subtotal = buyQuantity * selectedListing.asking_price;
    return subtotal + calculatePPT(subtotal);
  };

  const hasInsufficientBalance = getTotalCost() > balance;

  const filteredListings = listings.filter(listing => {
    // Don't show user's own listings
    if (listing.seller_session_id === user?.id) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      listing.stock_ticker.toLowerCase().includes(query) ||
      listing.sell_id.toLowerCase().includes(query)
    );
  });

  const handleBuy = () => {
    if (!selectedListing) return;
    buyAtFixedPrice.mutate({ 
      listingId: selectedListing.id, 
      quantity: buyQuantity 
    }, {
      onSuccess: () => {
        setShowBuyDialog(false);
        setSelectedListing(null);
        setBuyQuantity(1);
      }
    });
  };

  const handleOffer = () => {
    if (!selectedListing) return;
    submitOffer.mutate({
      listingId: selectedListing.id,
      offerPrice,
      quantity: offerQuantity,
    }, {
      onSuccess: () => {
        setShowOfferDialog(false);
        setSelectedListing(null);
        setOfferPrice(0);
        setOfferQuantity(1);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by stock ticker or seller ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No Listings Available</h3>
            <p className="text-muted-foreground mt-1">
              Check back later or create your own listing to sell shares.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{listing.stock_ticker}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Seller: {listing.sell_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>Broker: {listing.seller_broker_id}</span>
                    </div>
                  </div>
                  <Badge variant={listing.price_type === 'fixed' ? 'default' : 'secondary'}>
                    {listing.price_type === 'fixed' ? 'Fixed Price' : 'Open to Bids'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantity</span>
                    <p className="font-semibold">{listing.quantity.toLocaleString()} shares</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CSD (last 4)</span>
                    <p className="font-mono">****{listing.seller_csd_last4}</p>
                  </div>
                </div>

                {listing.price_type === 'fixed' && listing.asking_price && (
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <span className="text-sm text-muted-foreground">Asking Price</span>
                    <p className="text-xl font-bold text-primary">
                      {formatZMW(listing.asking_price)}/share
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      + 5% PPT Tax on purchase
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {listing.price_type === 'fixed' ? (
                    <Button 
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSelectedListing(listing);
                        setBuyQuantity(1);
                        setShowBuyDialog(true);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Buy Now
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSelectedListing(listing);
                        setOfferQuantity(1);
                        setOfferPrice(0);
                        setShowOfferDialog(true);
                      }}
                    >
                      <Gavel className="h-4 w-4" />
                      Make Offer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Shares</DialogTitle>
            <DialogDescription>
              You are buying {selectedListing?.stock_ticker} shares from seller {selectedListing?.sell_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-4">
              {/* Wallet Balance Display */}
              <div className={`p-3 rounded-lg flex items-center gap-2 ${hasInsufficientBalance ? 'bg-destructive/10 border border-destructive/30' : 'bg-success/10 border border-success/30'}`}>
                <Wallet className={`h-4 w-4 ${hasInsufficientBalance ? 'text-destructive' : 'text-success'}`} />
                <div className="flex-1">
                  <span className="text-sm font-medium">Your Wallet Balance</span>
                  <p className={`text-lg font-bold ${hasInsufficientBalance ? 'text-destructive' : 'text-success'}`}>
                    {formatZMW(balance)}
                  </p>
                </div>
                {hasInsufficientBalance && (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Quantity (max: {selectedListing.quantity})</label>
                <Input
                  type="number"
                  min={1}
                  max={selectedListing.quantity}
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Math.min(Number(e.target.value), selectedListing.quantity))}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatZMW((selectedListing.asking_price || 0) * buyQuantity)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>PPT Tax (5%)</span>
                  <span>{formatZMW(calculatePPT((selectedListing.asking_price || 0) * buyQuantity))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className={hasInsufficientBalance ? 'text-destructive' : 'text-primary'}>
                    {formatZMW(getTotalCost())}
                  </span>
                </div>
              </div>

              {hasInsufficientBalance && (
                <div className="p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Insufficient Balance</p>
                    <p className="text-xs text-muted-foreground">
                      You need {formatZMW(getTotalCost() - balance)} more to complete this purchase. Please deposit funds first.
                    </p>
                  </div>
                </div>
              )}

              {!hasInsufficientBalance && (
                <p className="text-sm text-muted-foreground">
                  Your wallet will be debited immediately upon confirmation.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBuy} disabled={buyAtFixedPrice.isPending || hasInsufficientBalance}>
              {buyAtFixedPrice.isPending ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              Submit an offer for {selectedListing?.stock_ticker} shares from seller {selectedListing?.sell_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Quantity (max: {selectedListing.quantity})</label>
                <Input
                  type="number"
                  min={1}
                  max={selectedListing.quantity}
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(Math.min(Number(e.target.value), selectedListing.quantity))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Your Offer Price (per share)</label>
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  placeholder="Enter your offer price"
                />
              </div>

              {offerPrice > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Offer Total</span>
                    <span>{formatZMW(offerPrice * offerQuantity)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>PPT Tax (5%)</span>
                    <span>{formatZMW(calculatePPT(offerPrice * offerQuantity))}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total if Accepted</span>
                    <span className="text-primary">
                      {formatZMW(offerPrice * offerQuantity + calculatePPT(offerPrice * offerQuantity))}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Your offer will be sent to the seller. Both brokers must approve before the trade executes.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleOffer} disabled={submitOffer.isPending || offerPrice <= 0}>
              {submitOffer.isPending ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
