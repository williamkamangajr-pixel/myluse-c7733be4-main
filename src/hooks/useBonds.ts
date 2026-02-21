import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bond } from '@/lib/types';

// Mock bonds data for development
const mockBonds: Bond[] = [
  {
    id: '1',
    ticker: 'GRZ-2025',
    name: 'Government of Zambia Bond 2025',
    issuer: 'Government of Zambia',
    bondType: 'Government',
    couponRate: 14.5,
    yieldToMaturity: 15.2,
    maturityDate: '2025-12-15',
    faceValue: 1000,
    currentPrice: 985,
    creditRating: 'B-',
    paymentFrequency: 'Semi-annual',
  },
  {
    id: '2',
    ticker: 'GRZ-2027',
    name: 'Government of Zambia Bond 2027',
    issuer: 'Government of Zambia',
    bondType: 'Government',
    couponRate: 16.0,
    yieldToMaturity: 16.5,
    maturityDate: '2027-06-30',
    faceValue: 1000,
    currentPrice: 972,
    creditRating: 'B-',
    paymentFrequency: 'Semi-annual',
  },
  {
    id: '3',
    ticker: 'GRZ-2030',
    name: 'Government of Zambia Bond 2030',
    issuer: 'Government of Zambia',
    bondType: 'Government',
    couponRate: 18.0,
    yieldToMaturity: 18.3,
    maturityDate: '2030-03-15',
    faceValue: 1000,
    currentPrice: 965,
    creditRating: 'B-',
    paymentFrequency: 'Semi-annual',
  },
  {
    id: '4',
    ticker: 'ZESCO-2026',
    name: 'ZESCO Corporate Bond 2026',
    issuer: 'ZESCO Limited',
    bondType: 'Corporate',
    couponRate: 17.5,
    yieldToMaturity: 18.0,
    maturityDate: '2026-09-30',
    faceValue: 1000,
    currentPrice: 990,
    creditRating: 'CCC+',
    paymentFrequency: 'Quarterly',
  },
];

export function useBonds() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bonds'],
    queryFn: async (): Promise<Bond[]> => {
      const { data: bonds, error } = await supabase
        .from('bonds')
        .select('*')
        .order('ticker');

      if (error) {
        console.error('Error fetching bonds:', error);
        return mockBonds;
      }

      if (!bonds || bonds.length === 0) {
        return mockBonds;
      }

      return bonds.map((bond) => ({
        id: bond.id,
        ticker: bond.ticker,
        name: bond.name,
        issuer: bond.issuer,
        bondType: bond.bond_type,
        couponRate: bond.coupon_rate,
        yieldToMaturity: bond.yield_to_maturity,
        maturityDate: bond.maturity_date,
        faceValue: bond.face_value,
        currentPrice: bond.current_price ?? 0,
        creditRating: bond.credit_rating,
        paymentFrequency: bond.payment_frequency,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    bonds: data ?? mockBonds,
    isLoading,
    error: error?.message,
    refetch,
  };
}
