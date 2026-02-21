import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMarketplace } from '@/hooks/useMarketplace';
import { formatZMW } from '@/lib/mockData';
import { format } from 'date-fns';
import { Package, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Active', variant: 'default' },
  pending_approval: { label: 'Pending Approval', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  completed: { label: 'Completed', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'outline' },
};

export function MyListings() {
  const { myListings, offersReceived, cancelListing } = useMarketplace();

  const getOffersForListing = (listingId: string) => {
    return offersReceived.filter(o => o.listing_id === listingId);
  };

  if (myListings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Listings Yet</h3>
          <p className="text-muted-foreground mt-1">
            Create your first listing to start selling shares on the marketplace.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {myListings.map((listing) => {
        const offers = getOffersForListing(listing.id);
        const status = statusConfig[listing.status] || { label: listing.status, variant: 'outline' as const };
        const canCancel = ['active', 'pending_approval'].includes(listing.status);

        return (
          <Card key={listing.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {listing.stock_ticker}
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sell ID: {listing.sell_id} • Listed {format(new Date(listing.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                {canCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove your listing from the marketplace. Any pending offers will be rejected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Listing</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => cancelListing.mutate(listing.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Cancel Listing
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Quantity</span>
                  <p className="font-semibold">{listing.quantity.toLocaleString()} shares</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price Type</span>
                  <p className="font-semibold capitalize">{listing.price_type.replace('_', ' ')}</p>
                </div>
                {listing.asking_price && (
                  <div>
                    <span className="text-muted-foreground">Asking Price</span>
                    <p className="font-semibold text-primary">{formatZMW(listing.asking_price)}/share</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Offers Received</span>
                  <p className="font-semibold">{offers.length}</p>
                </div>
              </div>

              {/* Offers Section */}
              {listing.price_type === 'open_to_bids' && offers.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Offers</h4>
                  <div className="space-y-2">
                    {offers.map(offer => (
                      <div 
                        key={offer.id} 
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {formatZMW(offer.offer_price)}/share × {offer.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From: {offer.buyer_sell_id} • {offer.buyer_broker_id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {offer.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                              <Button size="sm" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Accept
                              </Button>
                            </>
                          )}
                          {offer.status !== 'pending' && (
                            <Badge variant="outline">{offer.status}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
