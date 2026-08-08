import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getLatestRates } from '../api/currencyConversion';
import { currenciesByCode } from '../data/currencies';

export interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  symbol: string;
  convertedAmount: number;
  rate: number;
  isfavourite: boolean;
}

interface CurrencyContextType {
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  amount: number;
  setAmount: (amount: number) => void;
  currencyItems: CurrencyItem[];
  addCurrencyItem: (item: CurrencyItemInput) => void;
  removeCurrencyItem: (id: string) => void;
  togglefavourite: (id: string) => void;
  updateCurrencyItem: (id: string, newCode: string, currencyData: any) => Promise<void>;
  favouriteCurrencies: string[];
}

export interface CurrencyItemInput {
  code: string;
  name: string;
  symbol: string;
  convertedAmount: number;
  rate: number;
  isfavourite: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const BASE_CURRENCY_KEY = 'baseCurrency';
const SELECTED_CURRENCIES_KEY = 'selectedCurrencies';
const favourite_CURRENCIES_KEY = 'favouriteCurrencies';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [baseCurrency, setBaseCurrency] = useState<string>(() => {
    if (typeof window === 'undefined') return 'USD';
    try {
      const stored = localStorage.getItem(BASE_CURRENCY_KEY);
      return stored || 'USD';
    } catch {
      return 'USD';
    }
  });
  const [amount, setAmount] = useState<number>(100);
  const [currencyItems, setCurrencyItems] = useState<CurrencyItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(SELECTED_CURRENCIES_KEY);
      if (stored) return JSON.parse(stored) as CurrencyItem[];

      const storedBase = localStorage.getItem(BASE_CURRENCY_KEY) || 'USD';
      const defaultCode = storedBase === 'EUR' ? 'USD' : 'EUR';
      const currency = currenciesByCode[defaultCode];
      if (!currency) return [];

      return [{
        id: `${defaultCode}-default`,
        code: defaultCode,
        name: currency.name,
        symbol: currency.symbol,
        convertedAmount: 100,
        rate: 1,
        isfavourite: false
      }];
    } catch {
      return [];
    }
  });
  const [favouriteCurrencies, setfavouriteCurrencies] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(favourite_CURRENCIES_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BASE_CURRENCY_KEY, baseCurrency);
    } catch {}
  }, [baseCurrency]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SELECTED_CURRENCIES_KEY, JSON.stringify(currencyItems));
    } catch {}
  }, [currencyItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(favourite_CURRENCIES_KEY, JSON.stringify(favouriteCurrencies));
    } catch {}
  }, [favouriteCurrencies]);

  const addCurrencyItem = (item: CurrencyItemInput) => {
    const newItem: CurrencyItem = {
      ...item,
      id: `${item.code}-${Date.now()}`,
    };
    setCurrencyItems(prev => [...prev, newItem]);
  };

  const removeCurrencyItem = (id: string) => {
    setCurrencyItems(prev => prev.filter(item => item.id !== id));
  };

  const togglefavourite = (id: string) => {
    const item = currencyItems.find(i => i.id === id);
    const code = item?.code;
    if (code) {
      setfavouriteCurrencies(prev => {
        const set = new Set(prev);
        if (set.has(code)) set.delete(code);
        else set.add(code);
        return Array.from(set);
      });
    }
    setCurrencyItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, isfavourite: !i.isfavourite } : i
      )
    );
  };

  const updateCurrencyItem = async (id: string, newCode: string, currencyData: any) => {
    if (!currencyData) return;

    try {
      const response = await getLatestRates(baseCurrency);
      const rate = response.rates[newCode] ?? 1.0;
      const convertedAmount = amount * rate;

      setCurrencyItems(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                code: currencyData.iso_code,
                name: currencyData.name,
                symbol: currencyData.symbol,
                rate,
                convertedAmount
              }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);

      setCurrencyItems(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                code: currencyData.iso_code,
                name: currencyData.name,
                symbol: currencyData.symbol
              }
            : item
        )
      );
    }
  };

  useEffect(() => {
    const updateAllRates = async () => {
      if (currencyItems.length === 0) return;
      try {
        const response = await getLatestRates(baseCurrency);
        setCurrencyItems(prev =>
          prev.map(item => {
            const rate = response.rates[item.code] ?? 1.0;
            return {
              ...item,
              rate,
              convertedAmount: amount * rate
            };
          })
        );
      } catch (error) {
        console.error('Failed to update rates for base currency change:', error);
      }
    };

    updateAllRates();
  }, [baseCurrency]);

  useEffect(() => {
    setCurrencyItems(prev =>
      prev.map(item => ({
        ...item,
        convertedAmount: amount * item.rate
      }))
    );
  }, [amount]);

  return (
    <CurrencyContext.Provider value={{ 
      baseCurrency, 
      setBaseCurrency, 
      amount, 
      setAmount,
      currencyItems,
      addCurrencyItem,
      removeCurrencyItem,
      togglefavourite,
      updateCurrencyItem,
      favouriteCurrencies
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
