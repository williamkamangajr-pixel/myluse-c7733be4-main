import { useState, useEffect } from 'react';
import { PremiumLayout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Plus, TrendingUp, Clock, Package } from 'lucide-react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { MarketplaceListings } from '@/components/marketplace/MarketplaceListings';
import { CreateListingDialog } from '@/components/marketplace/CreateListingDialog';
import { MyListings } from '@/components/marketplace/MyListings';
import { MyOffers } from '@/components/marketplace/MyOffers';
import { formatZMW } from '@/lib/mockData';
import { useRealtimeMarketplace } from '@/hooks/useRealtimeSubscriptions';
import { useAuth } from '@/contexts/AuthContext';

const Marketplace = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { listings, myListings, myOffers, isLoading } = useMarketplace();
  
  // Enable real-time subscriptions for marketplace
  useRealtimeMarketplace(user?.id);

  const activeListings = listings.filter(l => l.status === 'active');
  const myActiveListings = myListings.filter(l => ['active', 'pending_approval'].includes(l.status));
  const pendingOffers = myOffers.filter(o => o.status === 'pending');

  return (
    <PremiumLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Buy and sell shares directly from other investors
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            List Shares for Sale
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Active Listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeListings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                My Listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myActiveListings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending Offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOffers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>PPT Tax Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">5%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse" className="gap-2">
              <Store className="h-4 w-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="my-listings" className="gap-2">
              <Package className="h-4 w-4" />
              My Listings
              {myActiveListings.length > 0 && (
                <Badge variant="secondary" className="ml-1">{myActiveListings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="my-offers" className="gap-2">
              <Clock className="h-4 w-4" />
              My Offers
              {pendingOffers.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingOffers.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <MarketplaceListings listings={activeListings} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="my-listings" className="space-y-4">
            <MyListings />
          </TabsContent>

          <TabsContent value="my-offers" className="space-y-4">
            <MyOffers />
          </TabsContent>
        </Tabs>
      </div>

      <CreateListingDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </PremiumLayout>
  );
};

export default Marketplace;
