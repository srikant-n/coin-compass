import { createContext, useContext, useState, type ReactNode } from 'react';

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
  updateCurrencyItem: (id: string, newCode: string, currencyData: any) => void;
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

  const updateCurrencyItem = (id: string, _newCode: string, currencyData: any) => {
    if (!currencyData) return;

    setCurrencyItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              code: currencyData.iso_code,
              name: currencyData.name,
              symbol: currencyData.symbol,
              // Mock rate update - would be replaced with API call
              rate: 1.0,
              convertedAmount: item.convertedAmount // Keep same amount for now
            }
          : item
      )
    );
  };

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
