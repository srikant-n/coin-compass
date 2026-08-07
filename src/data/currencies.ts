import currencies from './currencies.json';

export const POPULAR_CURRENCIES: string[] = ["USD","EUR","JPY","GBP","CNY","AUD","CAD","CHF","HKD","SGD","INR"]

const POPULAR_INDEX = new Map(POPULAR_CURRENCIES.map((code, i) => [code, i]));

// Sorted list: popular currencies first, then the rest alphabetically by name
export const currenciesList: Currency[] = (currencies as Currency[]).slice().sort((a, b) => {
  const aIndex = POPULAR_INDEX.get(a.iso_code);
  const bIndex = POPULAR_INDEX.get(b.iso_code);

  if (aIndex !== undefined && bIndex === undefined) return -1;
  if (aIndex === undefined && bIndex !== undefined) return 1;
  if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;

  return a.name.localeCompare(b.name);
});

export interface Currency {
  iso_code: string;
  iso_numeric: string;
  name: string;
  symbol: string;
}

export const currenciesByCode: Record<string, Currency> = (currencies as Currency[]).reduce(
  (acc, currency) => {
    acc[currency.iso_code] = currency;
    return acc;
  },
  {} as Record<string, Currency>
);

export default currenciesByCode;