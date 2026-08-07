import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getLatestRates } from '../api/currencyConversion';

export interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  symbol: string;
  convertedAmount: number;
  rate: number;
  isFavorite: boolean;
}

interface CurrencyContextType {
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  amount: number;
  setAmount: (amount: number) => void;
  currencyItems: CurrencyItem[];
  addCurrencyItem: (item: CurrencyItemInput) => void;
  removeCurrencyItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateCurrencyItem: (id: string, newCode: string, currencyData: any) => Promise<void>;
}

export interface CurrencyItemInput {
  code: string;
  name: string;
  symbol: string;
  convertedAmount: number;
  rate: number;
  isFavorite: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [amount, setAmount] = useState<number>(100);
  const [currencyItems, setCurrencyItems] = useState<CurrencyItem[]>([]);

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

  const toggleFavorite = (id: string) => {
    setCurrencyItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
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
      toggleFavorite,
      updateCurrencyItem
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
