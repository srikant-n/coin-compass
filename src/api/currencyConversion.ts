const BASE_URL = 'https://api.frankfurter.dev/v2/rates';

export interface CurrencyRatesResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface HistoricalRatesResponse {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, Record<string, number>>;
}

export interface GetRatesParams {
  base: string;
  quotes?: string[];
  date?: string;
  from?: string;
  to?: string;
  group?: 'week' | 'month';
}

export interface GetHistoricalRatesParams extends GetRatesParams {
  from: string;
  useNdjson?: boolean;
}

/**
 * Get current currency exchange rates
 * @param params - API parameters
 * @returns Promise with currency rates response
 */
export async function getRates(params: GetRatesParams): Promise<CurrencyRatesResponse> {
  const url = buildUrl(params);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get historical currency exchange rates
 * @param params - API parameters including from date
 * @returns Promise with historical rates response
 */
export async function getHistoricalRates(
  params: GetHistoricalRatesParams
): Promise<HistoricalRatesResponse> {
  const url = buildUrl(params);
  const headers: HeadersInit = {};
  
  if (params.useNdjson) {
    headers['Accept'] = 'application/x-ndjson';
  }
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  if (params.useNdjson) {
    return parseNdjsonResponse(await response.text());
  }
  
  return response.json();
}

/**
 * Get historical rates as NDJSON stream
 * @param params - API parameters including from date
 * @returns Async generator that yields rate objects
 */
export async function* streamHistoricalRates(
  params: Omit<GetHistoricalRatesParams, 'useNdjson'>
): AsyncGenerator<Record<string, Record<string, number>>> {
  const url = buildUrl(params);
  const response = await fetch(url, {
    headers: { 'Accept': 'application/x-ndjson' }
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }
  
  const decoder = new TextDecoder();
  let buffer = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.rates) {
              yield data.rates;
            }
          } catch (e) {
            console.error('Failed to parse NDJSON line:', line, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(params: GetRatesParams): string {
  const url = new URL(BASE_URL);
  url.searchParams.append('base', params.base);
  
  if (params.quotes && params.quotes.length > 0) {
    url.searchParams.append('quotes', params.quotes.join(','));
  }
  
  if (params.from) {
    url.searchParams.append('from', params.from);
  }
  
  if (params.group) {
    url.searchParams.append('group', params.group);
  }
  
  return url.toString();
}

/**
 * Parse NDJSON response text into historical rates format
 */
function parseNdjsonResponse(ndjsonText: string): HistoricalRatesResponse {
  const lines = ndjsonText.trim().split('\n');
  const rates: Record<string, Record<string, number>> = {};
  let base = '';
  let start_date = '';
  let end_date = '';
  let amount = 1;
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const data = JSON.parse(line);
        if (data.rates) {
          Object.assign(rates, data.rates);
        }
        if (data.base) base = data.base;
        if (data.start_date) start_date = data.start_date;
        if (data.end_date) end_date = data.end_date;
        if (data.amount) amount = data.amount;
      } catch (e) {
        console.error('Failed to parse NDJSON line:', line, e);
      }
    }
  }
  
  return {
    amount,
    base,
    start_date,
    end_date,
    rates
  };
}

/**
 * Get latest rates for specific currencies
 * @param baseCurrency - Base currency code
 * @param targetCurrencies - Array of target currency codes
 * @returns Promise with currency rates
 */
export async function getLatestRates(
  baseCurrency: string,
  targetCurrencies?: string[]
): Promise<CurrencyRatesResponse> {
  return getRates({
    base: baseCurrency,
    quotes: targetCurrencies
  });
}

/**
 * Get rates for a specific date
 * @param baseCurrency - Base currency code
 * @param date - Date in YYYY-MM-DD format
 * @param targetCurrencies - Array of target currency codes
 * @returns Promise with currency rates for the date
 */
export async function getRatesForDate(
  baseCurrency: string,
  date: string,
  targetCurrencies?: string[]
): Promise<CurrencyRatesResponse> {
  return getRates({
    base: baseCurrency,
    date,
    quotes: targetCurrencies
  });
}

/**
 * Get time series data grouped by week or month
 * @param baseCurrency - Base currency code
 * @param startDate - Start date in YYYY-MM-DD format
 * @param group - Group by 'week' or 'month'
 * @param targetCurrencies - Array of target currency codes
 * @returns Promise with historical rates
 */
export async function getTimeSeries(
  baseCurrency: string,
  startDate: string,
  group: 'week' | 'month',
  targetCurrencies?: string[]
): Promise<HistoricalRatesResponse> {
  return getHistoricalRates({
    base: baseCurrency,
    from: startDate,
    group,
    quotes: targetCurrencies
  });
}
