const BASE_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';

export interface CurrencyRatesResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface RawRatesResponse {
  date: string;
  [key: string]: any;
}

export interface GetRatesParams {
  base: string;
}

/**
 * Get current currency exchange rates
 * @param params - API parameters
 * @returns Promise with currency rates response
 */
export async function getRates(params: GetRatesParams): Promise<CurrencyRatesResponse> {
  const url = `${BASE_URL}/${params.base.toLowerCase()}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data: RawRatesResponse = await response.json();

  const rawRates = data[params.base.toLowerCase()] as Record<string, number> | undefined;
  if (!rawRates) {
    throw new Error(`No rates found for base currency: ${params.base}`);
  }

  const rates: Record<string, number> = {};
  for (const [code, rate] of Object.entries(rawRates)) {
    rates[code.toUpperCase()] = rate;
  }

  return {
    amount: 1,
    base: params.base.toUpperCase(),
    date: data.date,
    rates
  };
}

/**
 * Get latest rates for a base currency
 * @param baseCurrency - Base currency code
 * @returns Promise with currency rates
 */
export async function getLatestRates(baseCurrency: string): Promise<CurrencyRatesResponse> {
  return getRates({ base: baseCurrency });
}
