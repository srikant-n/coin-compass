import countryCurrencyPPP from './country_currency_ppp.json';

export interface Country {
  name: string;
  currency_code: string;
  ppp: number | null;
}

export const countriesList: Country[] = Object.entries(countryCurrencyPPP).map(([name, data]) => ({
  name,
  currency_code: data.currency_code,
  ppp: data.PPP,
}));

export const countriesListSorted: Country[] = [...countriesList].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const countriesByName: Record<string, Country> = countriesList.reduce(
  (acc, country) => {
    acc[country.name] = country;
    return acc;
  },
  {} as Record<string, Country>
);

export function getCountryByName(name: string): Country | undefined {
  return countriesByName[name];
}

export function getDefaultCountryForCurrency(currencyCode: string, preferredName?: string): string {
  const preferred = preferredName ? countriesList.find((c) => c.name === preferredName && c.currency_code === currencyCode) : undefined;
  if (preferred) return preferred.name;

  if (currencyCode === 'USD') return 'United States';

  const first = countriesList.find((c) => c.currency_code === currencyCode);
  return first?.name ?? 'United States';
}
