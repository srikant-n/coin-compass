import currencies from './currencies.json';

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