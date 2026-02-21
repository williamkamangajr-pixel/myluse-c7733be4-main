// LuSE Broker Data - Official brokers from luse.co.zm
// Trading Fees: SEC (0.125%), LuSE (0.25%), Broker (1.0%) = 1.375% base
// Property Transfer Tax (PTT): 3% on all SELL orders

export interface Broker {
  id: string;
  name: string;
  type: 'trading' | 'sponsoring' | 'both';
  address: string;
  email: string;
  phone?: string;
  website?: string;
}

export interface TradingFees {
  sec: number;        // 0.125%
  luse: number;       // 0.25%
  broker: number;     // 1.0%
  baseFee: number;    // 1.375%
  ptt: number;        // 3% (Property Transfer Tax - SELL only)
  sellTotal: number;  // 4.375%
}

export const TRADING_FEES = {
  SEC: 0.00125,      // 0.125%
  LUSE: 0.0025,      // 0.25%
  BROKER: 0.01,      // 1.00%
  PTT: 0.03,         // 3.00% Property Transfer Tax (sell only)
};

export const TOTAL_BASE_FEE = TRADING_FEES.SEC + TRADING_FEES.LUSE + TRADING_FEES.BROKER; // 1.375%
export const TOTAL_SELL_FEE = TOTAL_BASE_FEE + TRADING_FEES.PTT; // 4.375%

export function calculateTradingFees(amount: number, isSell: boolean) {
  const secFee = amount * TRADING_FEES.SEC;
  const luseFee = amount * TRADING_FEES.LUSE;
  const brokerFee = amount * TRADING_FEES.BROKER;
  const baseFee = secFee + luseFee + brokerFee;
  const pttFee = isSell ? amount * TRADING_FEES.PTT : 0;
  const totalFee = baseFee + pttFee;
  
  return {
    secFee,
    luseFee,
    brokerFee,
    baseFee,
    pttFee,
    totalFee,
    totalAmount: amount + totalFee,
    feeBreakdown: {
      sec: { label: 'SEC Fee (0.125%)', amount: secFee },
      luse: { label: 'LuSE Fee (0.25%)', amount: luseFee },
      broker: { label: 'Broker Commission (1.0%)', amount: brokerFee },
      ...(isSell ? { ptt: { label: 'Property Transfer Tax (3%)', amount: pttFee } } : {}),
    }
  };
}

// Official LuSE Trading Brokers
const luseBrokers: Broker[] = [
  {
    id: 'autus-securities',
    name: 'Autus Securities Limited',
    type: 'trading',
    address: 'Unit 4, The Mantra, Plot 251, Twin Palm Road, Ibex Hill, Lusaka',
    email: 'info@autussecurities.com',
    website: 'https://autussecurities.com',
  },
  {
    id: 'equity-capital',
    name: 'Equity Capital Resources Plc',
    type: 'trading',
    address: '4th Floor Godfrey House, Kantujila Street Fairview, Lusaka',
    email: 'info@ecrinvestments.com',
    website: 'http://www.ecrinvestments.com/',
  },
  {
    id: 'hobbiton',
    name: 'Hobbiton Investment Management',
    type: 'trading',
    address: 'No.13 Lunsemfwa Road, Kalundu, Lusaka',
    email: 'invest@hobbiton.co.zm',
    website: 'http://www.hobbiton.co.zm/',
  },
  {
    id: 'kukula-capital',
    name: 'Kukula Capital Limited',
    type: 'both',
    address: 'Farm 32 A, Off Zambezi Rd, Kabanana, Lusaka',
    email: 'info@kukula.com',
    website: 'http://www.kukulacapital.com/',
  },
  {
    id: 'longhorn-associates',
    name: 'Longhorn Associates',
    type: 'trading',
    address: 'Ground floor office park, Plot 1146/15, Lagos Road, Rhodespark, Lusaka',
    email: 'info@longhorn-associates.com',
    website: 'http://www.longhorn-associates.com/',
  },
  {
    id: 'madison-mamco',
    name: 'Madison Asset Management Company (MAMCo)',
    type: 'trading',
    address: 'Plot 316, Independence Avenue, P.O Box 37013, Lusaka',
    email: 'info@madisonassets.co.zm',
  },
  {
    id: 'pangaea-securities',
    name: 'Pangaea Securities',
    type: 'both',
    address: '1st Floor, Pangaea Office Park, Cnr of Kelvin Siwale & Great East Rd, Lusaka',
    email: 'info@pangaea.co.zm',
    website: 'http://www.pangaea.co.zm/',
  },
  {
    id: 'stockbrokers-zambia',
    name: 'Stockbrokers Zambia Ltd',
    type: 'both',
    address: '36 Mwapona Road, Woodlands, Lusaka',
    email: 'info@sbz.com.zm',
    website: 'http://www.sbz.com.zm/',
  },
  {
    id: 'money-acumen',
    name: 'Money Acumen Advisory',
    type: 'trading',
    address: '109B Fir Road, Woodlands, Lusaka',
    email: 'info@moneyacumenadvisory.com',
    phone: '0978966105',
    website: 'https://moneyacumenadvisory.com/',
  },
  {
    id: 'finance-securities',
    name: 'Finance Securities Limited',
    type: 'sponsoring',
    address: '2110/2111 Sepele Road, Lusaka',
    email: 'ops@financesecurities.com',
    phone: '+260 977475599',
  },
  {
    id: 'zanaco-investment',
    name: 'ZANACO Investment Banking',
    type: 'sponsoring',
    address: '2111-2113 Chainda place, Cairo Rd, Lusaka',
    email: 'investmentbanking@zanaco.co.zm',
    phone: '+260 211 425 650',
    website: 'https://www.zanaco.co.zm/',
  },
];

export function getBrokers(): Broker[] {
  return luseBrokers;
}

export function getTradingBrokers(): Broker[] {
  return luseBrokers.filter(b => b.type === 'trading' || b.type === 'both');
}

export function getSponsoringBrokers(): Broker[] {
  return luseBrokers.filter(b => b.type === 'sponsoring' || b.type === 'both');
}

export function getBrokerById(id: string): Broker | undefined {
  return luseBrokers.find(b => b.id === id);
}
