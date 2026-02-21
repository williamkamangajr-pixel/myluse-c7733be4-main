import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarketplace } from '@/hooks/useMarketplace';
import { formatZMW } from '@/lib/mockData';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const offerStatusConfig: Record<string, { 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ReactNode;
}> = {
  pending: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  seller_approved: { label: 'Seller Approved', variant: 'default', icon: <Loader2 className="h-3 w-3" /> },
  buyer_broker_approved: { label: 'Your Broker Approved', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  seller_broker_approved: { label: 'Seller Broker Approved', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  completed: { label: 'Completed', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', variant: 'outline', icon: <XCircle className="h-3 w-3" /> },
  expired: { label: 'Expired', variant: 'outline', icon: <Clock className="h-3 w-3" /> },
};

export function MyOffers() {
  const { myOffers, listings } = useMarketplace();

  const getListingForOffer = (listingId: string) => {
    return listings.find(l => l.id === listingId);
  };

  if (myOffers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Offers Yet</h3>
          <p className="text-muted-foreground mt-1">
            Browse the marketplace and make offers on listings you're interested in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {myOffers.map((offer) => {
        const listing = getListingForOffer(offer.listing_id);
        const status = offerStatusConfig[offer.status] || { 
          label: offer.status, 
          variant: 'outline' as const, 
          icon: null 
        };

        return (
          <Card key={offer.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {listing?.stock_ticker || 'Unknown Stock'}
                    <Badge variant={status.variant} className="gap-1">
                      {status.icon}
                      {status.label}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Offer to: {listing?.sell_id} • Submitted {format(new Date(offer.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Your Offer</span>
                  <p className="font-semibold text-primary">{formatZMW(offer.offer_price)}/share</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantity</span>
                  <p className="font-semibold">{offer.quantity.toLocaleString()} shares</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Offer Value</span>
                  <p className="font-semibold">{formatZMW(offer.offer_price * offer.quantity)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Seller's Broker</span>
                  <p className="font-semibold">{listing?.seller_broker_id || 'Unknown'}</p>
                </div>
              </div>

              {/* Status Timeline */}
              {offer.status !== 'pending' && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {offer.status === 'completed' && 'Trade completed! Shares added to your portfolio.'}
                    {offer.status === 'rejected' && 'Your offer was not accepted by the seller.'}
                    {offer.status === 'seller_approved' && 'Seller accepted. Awaiting broker approvals.'}
                    {offer.status === 'buyer_broker_approved' && 'Your broker approved. Awaiting seller broker.'}
                    {offer.status === 'seller_broker_approved' && 'Seller broker approved. Awaiting your broker.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
