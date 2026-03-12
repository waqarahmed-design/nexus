// ─── Types ───────────────────────────────────────────────────────────────────

export interface Holding {
  exchangeId: string;
  amount: number;
  valueUSD: number;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  color: string;
  priceUSD: number;
  totalAmount: number;
  totalValueUSD: number;
  change24hPercent: number;
  sparkline: number[];  // 7-day closing prices
  priceDaily:   { label: string; value: number }[];  // 30-day price history
  priceWeekly:  { label: string; value: number }[];  // 12-week price history
  priceMonthly: { label: string; value: number }[];  // 12-month price history
  holdings: Holding[];
  fundamentals: {
    ath:                number;   // All-time high price in USD
    athDate:            string;   // ISO date: "2024-12-17"
    marketCapBn:        number;   // Market cap in billions
    rank:               number;   // CoinGecko rank
    circulatingSupplyM: number;   // Circulating supply in millions
  };
}

export interface Exchange {
  id: string;
  name: string;
  color: string;
  colorDim: string;
  isConnected: boolean;
  totalValueUSD: number;
  assetsCount: number;
  change24hPercent: number;
  valueDaily:   { label: string; value: number }[];
  valueWeekly:  { label: string; value: number }[];
  valueMonthly: { label: string; value: number }[];
}

export interface Benchmark {
  id:              string;
  label:           string;
  returns7d:       number[];        // 7 normalized values, base 100
  change7dPercent: number;
  color:           string;          // line/dot color (benchmark brand colors — data layer only)
}

export interface RiskMetrics {
  volatilityScore:   number;       // 0–100
  volatilityLabel:   string;       // 'Low' | 'Moderate' | 'High'
  sharpeRatio:       number;
  concentrationRisk: string;
  topHoldingName:    string;
  topHoldingPercent: number;
  exchangeCount:     number;
  exchangeRiskLabel: string;       // 'Diversified' | 'Concentrated'
}

export type InsightType = 'warning' | 'info' | 'tip';

export interface Insight {
  id:              string;
  type:            InsightType;
  title:           string;
  body:            string;
  iconKey:         string;   // must match a key in Icons
  recommendations: string[]; // 2–3 actionable steps
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export const TOTAL_PORTFOLIO = {
  valueUSD:        84_473.34,
  change24hUSD:     2_847.23,
  change24hPercent: 3.48,
};

// 7-day portfolio history — used for sparklines
export const PORTFOLIO_HISTORY = [
  { day: 'Mon', value: 77_834 },
  { day: 'Tue', value: 80_120 },
  { day: 'Wed', value: 78_540 },
  { day: 'Thu', value: 82_310 },
  { day: 'Fri', value: 81_670 },
  { day: 'Sat', value: 83_200 },
  { day: 'Sun', value: 84_473 },
];

// 30-day portfolio history (daily close — most recent last)
export const PORTFOLIO_DAILY = [
  { label: 'D1',  value: 68_400 },
  { label: 'D2',  value: 69_100 },
  { label: 'D3',  value: 67_800 },
  { label: 'D4',  value: 70_200 },
  { label: 'D5',  value: 71_500 },
  { label: 'D6',  value: 70_900 },
  { label: 'D7',  value: 72_300 },
  { label: 'D8',  value: 73_800 },
  { label: 'D9',  value: 72_600 },
  { label: 'D10', value: 74_200 },
  { label: 'D11', value: 75_600 },
  { label: 'D12', value: 74_900 },
  { label: 'D13', value: 76_100 },
  { label: 'D14', value: 75_400 },
  { label: 'D15', value: 74_800 },
  { label: 'D16', value: 75_900 },
  { label: 'D17', value: 77_200 },
  { label: 'D18', value: 76_800 },
  { label: 'D19', value: 75_600 },
  { label: 'D20', value: 76_400 },
  { label: 'D21', value: 77_100 },
  { label: 'D22', value: 76_700 },
  { label: 'D23', value: 77_400 },
  { label: 'D24', value: 77_834 },
  { label: 'D25', value: 80_120 },
  { label: 'D26', value: 78_540 },
  { label: 'D27', value: 82_310 },
  { label: 'D28', value: 81_670 },
  { label: 'D29', value: 83_200 },
  { label: 'D30', value: 84_473 },
];

// 12-week portfolio history (weekly close — most recent last)
export const PORTFOLIO_WEEKLY = [
  { label: 'W1',  value: 52_400 },
  { label: 'W2',  value: 54_100 },
  { label: 'W3',  value: 56_800 },
  { label: 'W4',  value: 55_200 },
  { label: 'W5',  value: 58_900 },
  { label: 'W6',  value: 61_400 },
  { label: 'W7',  value: 65_700 },
  { label: 'W8',  value: 68_300 },
  { label: 'W9',  value: 70_900 },
  { label: 'W10', value: 73_400 },
  { label: 'W11', value: 77_200 },
  { label: 'W12', value: 84_473 },
];

// 12-month portfolio history (monthly close — most recent last)
export const PORTFOLIO_MONTHLY = [
  { label: 'M1',  value: 32_100 },
  { label: 'M2',  value: 35_800 },
  { label: 'M3',  value: 38_200 },
  { label: 'M4',  value: 41_500 },
  { label: 'M5',  value: 39_800 },
  { label: 'M6',  value: 44_200 },
  { label: 'M7',  value: 48_220 },
  { label: 'M8',  value: 55_670 },
  { label: 'M9',  value: 52_140 },
  { label: 'M10', value: 63_910 },
  { label: 'M11', value: 71_380 },
  { label: 'M12', value: 84_473 },
];

// ─── Assets ───────────────────────────────────────────────────────────────────

export const ASSETS: Asset[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    color: '#F7931A',
    priceUSD: 67_345.68,
    totalAmount: 0.72,
    totalValueUSD: 48_488.89,
    change24hPercent: 2.34,
    sparkline: [62_400, 63_800, 61_900, 64_500, 65_100, 66_200, 67_345],
    priceDaily: [
      {label:'D1',value:58_200},{label:'D2',value:59_100},{label:'D3',value:57_800},{label:'D4',value:60_200},{label:'D5',value:61_500},
      {label:'D6',value:60_900},{label:'D7',value:62_300},{label:'D8',value:63_800},{label:'D9',value:62_600},{label:'D10',value:64_200},
      {label:'D11',value:65_600},{label:'D12',value:64_900},{label:'D13',value:66_100},{label:'D14',value:65_400},{label:'D15',value:64_800},
      {label:'D16',value:65_900},{label:'D17',value:67_200},{label:'D18',value:66_800},{label:'D19',value:65_600},{label:'D20',value:66_400},
      {label:'D21',value:67_100},{label:'D22',value:66_700},{label:'D23',value:67_400},{label:'D24',value:63_800},{label:'D25',value:65_100},
      {label:'D26',value:61_900},{label:'D27',value:64_500},{label:'D28',value:65_100},{label:'D29',value:66_200},{label:'D30',value:67_345},
    ],
    priceWeekly: [
      {label:'W1',value:45_200},{label:'W2',value:48_100},{label:'W3',value:46_800},{label:'W4',value:50_200},
      {label:'W5',value:52_900},{label:'W6',value:55_400},{label:'W7',value:58_700},{label:'W8',value:61_300},
      {label:'W9',value:60_900},{label:'W10',value:63_400},{label:'W11',value:65_200},{label:'W12',value:67_345},
    ],
    priceMonthly: [
      {label:'M1',value:28_100},{label:'M2',value:32_800},{label:'M3',value:36_200},{label:'M4',value:40_500},
      {label:'M5',value:38_800},{label:'M6',value:44_200},{label:'M7',value:49_220},{label:'M8',value:53_670},
      {label:'M9',value:51_140},{label:'M10',value:58_910},{label:'M11',value:62_380},{label:'M12',value:67_345},
    ],
    holdings: [
      { exchangeId: 'binance',  amount: 0.42, valueUSD: 28_285.19 },
      { exchangeId: 'coinbase', amount: 0.30, valueUSD: 20_203.70 },
    ],
    fundamentals: {
      ath: 108364, athDate: '2024-12-17', marketCapBn: 1320.4, rank: 1, circulatingSupplyM: 19.7,
    },
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    color: '#627EEA',
    priceUSD: 3_508.45,
    totalAmount: 4.2,
    totalValueUSD: 14_735.49,
    change24hPercent: -1.24,
    sparkline: [3_640, 3_590, 3_555, 3_520, 3_490, 3_510, 3_508],
    priceDaily: [
      {label:'D1',value:3_140},{label:'D2',value:3_190},{label:'D3',value:3_120},{label:'D4',value:3_220},{label:'D5',value:3_310},
      {label:'D6',value:3_290},{label:'D7',value:3_350},{label:'D8',value:3_390},{label:'D9',value:3_360},{label:'D10',value:3_420},
      {label:'D11',value:3_450},{label:'D12',value:3_430},{label:'D13',value:3_460},{label:'D14',value:3_440},{label:'D15',value:3_415},
      {label:'D16',value:3_435},{label:'D17',value:3_480},{label:'D18',value:3_465},{label:'D19',value:3_440},{label:'D20',value:3_450},
      {label:'D21',value:3_470},{label:'D22',value:3_455},{label:'D23',value:3_485},{label:'D24',value:3_590},{label:'D25',value:3_555},
      {label:'D26',value:3_520},{label:'D27',value:3_490},{label:'D28',value:3_510},{label:'D29',value:3_520},{label:'D30',value:3_508},
    ],
    priceWeekly: [
      {label:'W1',value:2_200},{label:'W2',value:2_350},{label:'W3',value:2_480},{label:'W4',value:2_640},
      {label:'W5',value:2_720},{label:'W6',value:2_890},{label:'W7',value:3_050},{label:'W8',value:3_180},
      {label:'W9',value:3_090},{label:'W10',value:3_260},{label:'W11',value:3_420},{label:'W12',value:3_508},
    ],
    priceMonthly: [
      {label:'M1',value:1_500},{label:'M2',value:1_820},{label:'M3',value:2_100},{label:'M4',value:2_450},
      {label:'M5',value:2_280},{label:'M6',value:2_680},{label:'M7',value:2_920},{label:'M8',value:3_150},
      {label:'M9',value:2_940},{label:'M10',value:3_280},{label:'M11',value:3_420},{label:'M12',value:3_508},
    ],
    holdings: [
      { exchangeId: 'coinbase', amount: 2.8, valueUSD: 9_823.66 },
      { exchangeId: 'kraken',   amount: 1.4, valueUSD: 4_911.83 },
    ],
    fundamentals: {
      ath: 4878, athDate: '2021-11-10', marketCapBn: 420.8, rank: 2, circulatingSupplyM: 120.2,
    },
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    color: '#9945FF',
    priceUSD: 142.18,
    totalAmount: 45.5,
    totalValueUSD: 6_469.19,
    change24hPercent: 5.67,
    sparkline: [118, 122, 119, 127, 133, 138, 142],
    priceDaily: [
      {label:'D1',value:98},{label:'D2',value:102},{label:'D3',value:99},{label:'D4',value:107},{label:'D5',value:112},
      {label:'D6',value:110},{label:'D7',value:115},{label:'D8',value:118},{label:'D9',value:116},{label:'D10',value:119},
      {label:'D11',value:122},{label:'D12',value:120},{label:'D13',value:123},{label:'D14',value:121},{label:'D15',value:119},
      {label:'D16',value:121},{label:'D17',value:124},{label:'D18',value:122},{label:'D19',value:120},{label:'D20',value:121},
      {label:'D21',value:123},{label:'D22',value:122},{label:'D23',value:124},{label:'D24',value:122},{label:'D25',value:119},
      {label:'D26',value:127},{label:'D27',value:133},{label:'D28',value:138},{label:'D29',value:140},{label:'D30',value:142},
    ],
    priceWeekly: [
      {label:'W1',value:72},{label:'W2',value:78},{label:'W3',value:82},{label:'W4',value:88},
      {label:'W5',value:95},{label:'W6',value:102},{label:'W7',value:110},{label:'W8',value:118},
      {label:'W9',value:122},{label:'W10',value:128},{label:'W11',value:136},{label:'W12',value:142},
    ],
    priceMonthly: [
      {label:'M1',value:45},{label:'M2',value:52},{label:'M3',value:58},{label:'M4',value:68},
      {label:'M5',value:62},{label:'M6',value:75},{label:'M7',value:85},{label:'M8',value:98},
      {label:'M9',value:92},{label:'M10',value:112},{label:'M11',value:128},{label:'M12',value:142},
    ],
    holdings: [
      { exchangeId: 'coinbase', amount: 45.5, valueUSD: 6_469.19 },
    ],
    fundamentals: {
      ath: 259.96, athDate: '2021-11-06', marketCapBn: 62.1, rank: 5, circulatingSupplyM: 436.8,
    },
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    color: '#F0B90B',
    priceUSD: 582.30,
    totalAmount: 8.3,
    totalValueUSD: 4_833.09,
    change24hPercent: 0.82,
    sparkline: [568, 572, 565, 575, 578, 574, 582],
    priceDaily: [
      {label:'D1',value:542},{label:'D2',value:548},{label:'D3',value:541},{label:'D4',value:551},{label:'D5',value:556},
      {label:'D6',value:553},{label:'D7',value:558},{label:'D8',value:562},{label:'D9',value:559},{label:'D10',value:564},
      {label:'D11',value:567},{label:'D12',value:565},{label:'D13',value:568},{label:'D14',value:566},{label:'D15',value:563},
      {label:'D16',value:566},{label:'D17',value:570},{label:'D18',value:568},{label:'D19',value:565},{label:'D20',value:567},
      {label:'D21',value:569},{label:'D22',value:568},{label:'D23',value:570},{label:'D24',value:572},{label:'D25',value:565},
      {label:'D26',value:575},{label:'D27',value:578},{label:'D28',value:574},{label:'D29',value:580},{label:'D30',value:582},
    ],
    priceWeekly: [
      {label:'W1',value:428},{label:'W2',value:445},{label:'W3',value:458},{label:'W4',value:472},
      {label:'W5',value:488},{label:'W6',value:502},{label:'W7',value:520},{label:'W8',value:538},
      {label:'W9',value:548},{label:'W10',value:558},{label:'W11',value:568},{label:'W12',value:582},
    ],
    priceMonthly: [
      {label:'M1',value:320},{label:'M2',value:345},{label:'M3',value:368},{label:'M4',value:390},
      {label:'M5',value:378},{label:'M6',value:408},{label:'M7',value:432},{label:'M8',value:462},
      {label:'M9',value:448},{label:'M10',value:492},{label:'M11',value:538},{label:'M12',value:582},
    ],
    holdings: [
      { exchangeId: 'binance', amount: 8.3, valueUSD: 4_833.09 },
    ],
    fundamentals: {
      ath: 686.31, athDate: '2021-05-10', marketCapBn: 84.3, rank: 4, circulatingSupplyM: 144.9,
    },
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    color: '#26A17B',
    priceUSD: 1.0,
    totalAmount: 5_246.18,
    totalValueUSD: 5_246.18,
    change24hPercent: 0.01,
    sparkline: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    priceDaily:   Array.from({length:30},(_,i)=>({label:`D${i+1}`,value:1.0})),
    priceWeekly:  Array.from({length:12},(_,i)=>({label:`W${i+1}`,value:1.0})),
    priceMonthly: Array.from({length:12},(_,i)=>({label:`M${i+1}`,value:1.0})),
    holdings: [
      { exchangeId: 'binance', amount: 3_246.18, valueUSD: 3_246.18 },
      { exchangeId: 'kraken',  amount: 2_000.00, valueUSD: 2_000.00 },
    ],
    fundamentals: {
      ath: 1.22, athDate: '2018-07-24', marketCapBn: 108.6, rank: 3, circulatingSupplyM: 108540,
    },
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    color: '#0085C3',
    priceUSD: 0.553,
    totalAmount: 8_500,
    totalValueUSD: 4_700.50,
    change24hPercent: -2.15,
    sparkline: [0.582, 0.574, 0.568, 0.559, 0.552, 0.549, 0.553],
    priceDaily: [
      {label:'D1',value:0.472},{label:'D2',value:0.481},{label:'D3',value:0.475},{label:'D4',value:0.489},{label:'D5',value:0.495},
      {label:'D6',value:0.491},{label:'D7',value:0.498},{label:'D8',value:0.504},{label:'D9',value:0.499},{label:'D10',value:0.508},
      {label:'D11',value:0.514},{label:'D12',value:0.510},{label:'D13',value:0.516},{label:'D14',value:0.512},{label:'D15',value:0.508},
      {label:'D16',value:0.512},{label:'D17',value:0.518},{label:'D18',value:0.515},{label:'D19',value:0.510},{label:'D20',value:0.513},
      {label:'D21',value:0.516},{label:'D22',value:0.514},{label:'D23',value:0.518},{label:'D24',value:0.574},{label:'D25',value:0.568},
      {label:'D26',value:0.559},{label:'D27',value:0.552},{label:'D28',value:0.549},{label:'D29',value:0.551},{label:'D30',value:0.553},
    ],
    priceWeekly: [
      {label:'W1',value:0.325},{label:'W2',value:0.342},{label:'W3',value:0.358},{label:'W4',value:0.378},
      {label:'W5',value:0.392},{label:'W6',value:0.410},{label:'W7',value:0.432},{label:'W8',value:0.455},
      {label:'W9',value:0.468},{label:'W10',value:0.482},{label:'W11',value:0.512},{label:'W12',value:0.553},
    ],
    priceMonthly: [
      {label:'M1',value:0.245},{label:'M2',value:0.278},{label:'M3',value:0.305},{label:'M4',value:0.342},
      {label:'M5',value:0.318},{label:'M6',value:0.368},{label:'M7',value:0.402},{label:'M8',value:0.445},
      {label:'M9',value:0.418},{label:'M10',value:0.482},{label:'M11',value:0.522},{label:'M12',value:0.553},
    ],
    holdings: [
      { exchangeId: 'binance', amount: 2_000, valueUSD: 1_106.00 },
      { exchangeId: 'kraken',  amount: 6_500, valueUSD: 3_594.50 },
    ],
    fundamentals: {
      ath: 3.40, athDate: '2018-01-07', marketCapBn: 30.2, rank: 6, circulatingSupplyM: 54600,
    },
  },
];

// ─── Exchanges ────────────────────────────────────────────────────────────────

export const EXCHANGES: Exchange[] = [
  {
    id: 'binance',
    name: 'Binance',
    color: '#F0B90B',
    colorDim: 'rgba(240,185,11,0.12)',
    isConnected: true,
    totalValueUSD: 37_470.46,
    assetsCount: 4,
    change24hPercent: 1.89,
    valueDaily: [
      {label:'D1',value:30_250},{label:'D2',value:30_800},{label:'D3',value:29_900},{label:'D4',value:31_200},{label:'D5',value:31_900},
      {label:'D6',value:31_500},{label:'D7',value:32_300},{label:'D8',value:33_100},{label:'D9',value:32_500},{label:'D10',value:33_400},
      {label:'D11',value:34_100},{label:'D12',value:33_700},{label:'D13',value:34_500},{label:'D14',value:34_000},{label:'D15',value:33_600},
      {label:'D16',value:34_200},{label:'D17',value:35_100},{label:'D18',value:34_800},{label:'D19',value:34_100},{label:'D20',value:34_600},
      {label:'D21',value:35_000},{label:'D22',value:34_700},{label:'D23',value:35_300},{label:'D24',value:33_100},{label:'D25',value:33_800},
      {label:'D26',value:32_100},{label:'D27',value:33_600},{label:'D28',value:33_900},{label:'D29',value:34_800},{label:'D30',value:37_470},
    ],
    valueWeekly: [
      {label:'W1',value:23_200},{label:'W2',value:24_800},{label:'W3',value:24_100},{label:'W4',value:25_900},
      {label:'W5',value:27_300},{label:'W6',value:28_600},{label:'W7',value:30_400},{label:'W8',value:31_800},
      {label:'W9',value:31_500},{label:'W10',value:32_900},{label:'W11',value:33_800},{label:'W12',value:37_470},
    ],
    valueMonthly: [
      {label:'M1',value:14_200},{label:'M2',value:16_500},{label:'M3',value:18_800},{label:'M4',value:21_200},
      {label:'M5',value:20_100},{label:'M6',value:23_400},{label:'M7',value:25_600},{label:'M8',value:28_900},
      {label:'M9',value:27_400},{label:'M10',value:31_200},{label:'M11',value:33_500},{label:'M12',value:37_470},
    ],
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    color: '#4D7FFF',
    colorDim: 'rgba(77,127,255,0.12)',
    isConnected: true,
    totalValueUSD: 36_496.55,
    assetsCount: 3,
    change24hPercent: 1.24,
    valueDaily: [
      {label:'D1',value:29_400},{label:'D2',value:29_900},{label:'D3',value:29_100},{label:'D4',value:30_300},{label:'D5',value:31_000},
      {label:'D6',value:30_700},{label:'D7',value:31_400},{label:'D8',value:32_200},{label:'D9',value:31_600},{label:'D10',value:32_500},
      {label:'D11',value:33_200},{label:'D12',value:32_800},{label:'D13',value:33_600},{label:'D14',value:33_100},{label:'D15',value:32_700},
      {label:'D16',value:33_200},{label:'D17',value:34_100},{label:'D18',value:33_800},{label:'D19',value:33_200},{label:'D20',value:33_700},
      {label:'D21',value:34_100},{label:'D22',value:33_800},{label:'D23',value:34_300},{label:'D24',value:32_200},{label:'D25',value:32_900},
      {label:'D26',value:31_200},{label:'D27',value:32_700},{label:'D28',value:33_000},{label:'D29',value:33_900},{label:'D30',value:36_496},
    ],
    valueWeekly: [
      {label:'W1',value:22_600},{label:'W2',value:24_100},{label:'W3',value:23_500},{label:'W4',value:25_200},
      {label:'W5',value:26_600},{label:'W6',value:27_800},{label:'W7',value:29_600},{label:'W8',value:30_900},
      {label:'W9',value:30_600},{label:'W10',value:32_000},{label:'W11',value:32_900},{label:'W12',value:36_496},
    ],
    valueMonthly: [
      {label:'M1',value:13_850},{label:'M2',value:16_100},{label:'M3',value:18_300},{label:'M4',value:20_700},
      {label:'M5',value:19_600},{label:'M6',value:22_800},{label:'M7',value:24_900},{label:'M8',value:28_100},
      {label:'M9',value:26_700},{label:'M10',value:30_400},{label:'M11',value:32_600},{label:'M12',value:36_496},
    ],
  },
  {
    id: 'kraken',
    name: 'Kraken',
    color: '#8B7FF7',
    colorDim: 'rgba(139,127,247,0.12)',
    isConnected: true,
    totalValueUSD: 10_506.33,
    assetsCount: 3,
    change24hPercent: -2.15,
    valueDaily: [
      {label:'D1',value:8_460},{label:'D2',value:8_620},{label:'D3',value:8_380},{label:'D4',value:8_740},{label:'D5',value:8_940},
      {label:'D6',value:8_820},{label:'D7',value:9_050},{label:'D8',value:9_230},{label:'D9',value:9_080},{label:'D10',value:9_310},
      {label:'D11',value:9_480},{label:'D12',value:9_350},{label:'D13',value:9_560},{label:'D14',value:9_420},{label:'D15',value:9_310},
      {label:'D16',value:9_450},{label:'D17',value:9_680},{label:'D18',value:9_580},{label:'D19',value:9_420},{label:'D20',value:9_530},
      {label:'D21',value:9_680},{label:'D22',value:9_580},{label:'D23',value:9_730},{label:'D24',value:9_230},{label:'D25',value:9_450},
      {label:'D26',value:8_980},{label:'D27',value:9_360},{label:'D28',value:9_480},{label:'D29',value:9_820},{label:'D30',value:10_506},
    ],
    valueWeekly: [
      {label:'W1',value:6_500},{label:'W2',value:6_940},{label:'W3',value:6_720},{label:'W4',value:7_240},
      {label:'W5',value:7_680},{label:'W6',value:8_100},{label:'W7',value:8_620},{label:'W8',value:9_050},
      {label:'W9',value:8_950},{label:'W10',value:9_340},{label:'W11',value:9_760},{label:'W12',value:10_506},
    ],
    valueMonthly: [
      {label:'M1',value:4_100},{label:'M2',value:4_680},{label:'M3',value:5_200},{label:'M4',value:5_900},
      {label:'M5',value:5_580},{label:'M6',value:6_420},{label:'M7',value:7_100},{label:'M8',value:8_020},
      {label:'M9',value:7_620},{label:'M10',value:8_760},{label:'M11',value:9_480},{label:'M12',value:10_506},
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAssetsForExchange(exchangeId: string): Asset[] {
  return ASSETS.filter((a) => a.holdings.some((h) => h.exchangeId === exchangeId));
}

export function getHolding(asset: Asset, exchangeId: string): Holding | undefined {
  return asset.holdings.find((h) => h.exchangeId === exchangeId);
}

export function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${value.toFixed(2)}`;
}

export function formatAmount(amount: number, symbol: string): string {
  if (amount >= 1_000)
    return `${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${symbol}`;
  if (amount >= 1) return `${amount.toFixed(4)} ${symbol}`;
  return `${amount.toFixed(6)} ${symbol}`;
}

export function formatPrice(price: number): string {
  if (price >= 1_000)
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(3)}`;
  return `$${price.toFixed(4)}`;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const BENCHMARKS: Benchmark[] = [
  {
    id: 'portfolio', label: 'Your Portfolio',
    returns7d: [100, 102.9, 100.9, 105.7, 105.0, 106.9, 108.5],
    change7dPercent: 8.52, color: '#C8E847',
  },
  {
    id: 'btc', label: 'Bitcoin',
    returns7d: [100, 102.2, 99.2, 103.4, 104.3, 106.1, 107.9],
    change7dPercent: 7.86, color: '#F7931A',
  },
  {
    id: 'eth', label: 'Ethereum',
    returns7d: [100, 98.6, 97.6, 96.6, 95.8, 96.4, 96.4],
    change7dPercent: -3.62, color: '#627EEA',
  },
  {
    id: 'sp500', label: 'S&P 500',
    returns7d: [100, 100.4, 99.8, 101.1, 101.3, 101.8, 102.2],
    change7dPercent: 2.18, color: '#4ADE80',
  },
];

export const RISK_METRICS: RiskMetrics = {
  volatilityScore: 72,
  volatilityLabel: 'High',
  sharpeRatio: 1.84,
  concentrationRisk: 'BTC dominates 57% of your portfolio',
  topHoldingName: 'Bitcoin',
  topHoldingPercent: 57.4,
  exchangeCount: 3,
  exchangeRiskLabel: 'Diversified',
};

export const INSIGHTS: Insight[] = [
  {
    id: 'btc-concentration', type: 'warning',
    title: 'High concentration in Bitcoin',
    body: 'BTC represents 57% of your total portfolio. Consider diversifying to reduce single-asset risk.',
    iconKey: 'alertCircle',
    recommendations: [
      'Consider allocating 5–10% of BTC gains into ETH or SOL to reduce single-asset exposure.',
      'Set a rebalancing alert when BTC exceeds 60% of your portfolio.',
      'Review your exchange allocation — Binance holds the majority of your BTC.',
    ],
  },
  {
    id: 'outperforming', type: 'tip',
    title: 'Outperforming Bitcoin this week',
    body: "Your portfolio gained 8.5% in 7 days vs. BTC's 7.9%. SOL's rally is the main driver.",
    iconKey: 'flash',
    recommendations: [
      "SOL's 30-day rally is the primary driver of your edge over BTC.",
      'Lock in gains gradually — consider moving 10–15% of SOL profits to stablecoins.',
      'Watch for SOL retracement signals if the rally extends beyond historical patterns.',
    ],
  },
  {
    id: 'exchange-split', type: 'info',
    title: 'Assets spread across 3 exchanges',
    body: 'Binance holds 44%, Coinbase 43%, Kraken 12%. Multi-exchange exposure reduces single point of failure.',
    iconKey: 'layers',
    recommendations: [
      'Your 3-exchange spread reduces single-point-of-failure risk effectively.',
      'Ensure API keys on all exchanges are read-only and rotated every 90 days.',
      'Consider moving more of your XRP from Kraken to Coinbase for added redundancy.',
    ],
  },
  {
    id: 'usdt-drag', type: 'info',
    title: 'USDT earning no yield',
    body: '$5,246 in Tether is sitting idle. Stablecoin yield products could put it to work.',
    iconKey: 'info',
    recommendations: [
      'Explore on-chain stablecoin yield products (AAVE, Compound) for your idle USDT.',
      'Even a 4–5% APY on $5,246 adds ~$210–$262 annually with minimal risk.',
      'Keep at least $1,000 liquid for rapid rebalancing opportunities.',
    ],
  },
  {
    id: 'high-volatility', type: 'warning',
    title: 'Portfolio volatility is elevated',
    body: 'Your 30-day volatility score of 72/100 is above average. SOL drives much of this.',
    iconKey: 'alertCircle',
    recommendations: [
      'SOL drives ~40% of your portfolio volatility — watch its position size carefully.',
      'A volatility score above 70 suggests reducing leverage or adding stablecoin buffer.',
      'Review your portfolio weekly during high-volatility market conditions.',
    ],
  },
];
