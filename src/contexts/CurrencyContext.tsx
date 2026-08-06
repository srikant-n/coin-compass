import { createContext, useContext, useState, type ReactNode } from 'react';

interface CurrencyContextType {
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  amount: number;
  setAmount: (amount: number) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [amount, setAmount] = useState<number>(100);

  return (
    <CurrencyContext.Provider value={{ baseCurrency, setBaseCurrency, amount, setAmount }}>
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
