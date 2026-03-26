export interface Source {
  name: string;
  url?: string;
}

export interface MarketData {
  international_gold_usd_oz: number;
  international_silver_usd_oz: number;
  china_gold_spot_cny_g: number;
  china_silver_spot_cny_g: number;
  retail_gold_cny_g: number; // Avg brand price (e.g., Chow Tai Fook)
  recycle_gold_cny_g: number; // Avg buyback price
  retail_silver_cny_g: number; // Avg retail silver price
  recycle_silver_cny_g: number; // Avg silver buyback price
  usd_cny_rate: number;
  last_updated: string;
  sources: Source[];
}

export type MetalType = 'gold' | 'silver';
export type UnitType = 'g' | 'oz';

export interface CalculatorState {
  metal: MetalType;
  unit: UnitType;
  amount: string;
}
