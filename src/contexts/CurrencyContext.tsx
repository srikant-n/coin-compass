import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getLatestRates } from '../api/currencyConversion';
import { currenciesByCode } from '../data/currencies';
import { countriesByName, countriesListSorted, getDefaultCountryForCurrency } from '../data/countries';

export interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  symbol: string;
  convertedAmount: number;
  rate: number;
  isfavourite: boolean;
  country?: string;
  ppp?: number | null;
  pppAmount?: number | null;
}

interface CurrencyContextType {
  viewMode: 'currency' | 'country';
  setViewMode: (mode: 'currency' | 'country') => void;
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  baseCountry: string;
  setBaseCountry: (country: string) => void;
  amount: number;
  setAmount: (amount: number) => void;
  currencyItems: CurrencyItem[];
  addCurrencyItem: (item: CurrencyItemInput) => void;
  removeCurrencyItem: (id: string) => void;
  togglefavourite: (id: string) => void;
  updateCurrencyItem: (id: string, newCode: string, currencyData: any, countryName?: string) => Promise<void>;
  favouriteCurrencies: string[];
}

export interface CurrencyItemInput {
  code: string;
  name: string;
  symbol: string;
  convertedAmount: number;
  rate: number;
  isfavourite: boolean;
  country?: string;
  ppp?: number | null;
  pppAmount?: number | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const BASE_CURRENCY_KEY = 'baseCurrency';
const BASE_COUNTRY_KEY = 'baseCountry';
const CURRENCY_TARGETS_KEY = 'selectedCurrencies';
const COUNTRY_TARGETS_KEY = 'selectedCountries';
const favourite_CURRENCIES_KEY = 'favouriteCurrencies';
const VIEW_MODE_KEY = 'viewMode';

function computePPPAmount(
  amount: number,
  baseCountry: string,
  country: string | undefined,
  viewMode: 'currency' | 'country'
): number | null {
  if (viewMode !== 'country' || !country) return null;
  const base = countriesByName[baseCountry];
  const target = countriesByName[country];
  if (!base || !target || base.ppp == null || target.ppp == null || base.ppp === 0) return null;
  return amount * (target.ppp / base.ppp);
}

function loadItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function loadString(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function defaultCurrencyTargets(baseCurrency: string): CurrencyItem[] {
  const defaultCode = baseCurrency === 'EUR' ? 'USD' : 'EUR';
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
}

function defaultCountryTargets(baseCountry: string): CurrencyItem[] {
  const country = countriesListSorted.find(c => c.name !== baseCountry);
  if (!country) return [];
  const currency = currenciesByCode[country.currency_code];
  if (!currency) return [];

  return [{
    id: `${country.name}-default`,
    code: currency.iso_code,
    name: currency.name,
    symbol: currency.symbol,
    convertedAmount: 100,
    rate: 1,
    isfavourite: false,
    country: country.name,
    ppp: country.ppp,
    pppAmount: computePPPAmount(100, baseCountry, country.name, 'country')
  }];
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyBase, setCurrencyBase] = useState<string>(() => loadString(BASE_CURRENCY_KEY, 'USD'));
  const [countryBase, setCountryBase] = useState<string>(() => loadString(BASE_COUNTRY_KEY, 'United States'));
  const [viewMode, setViewMode] = useState<'currency' | 'country'>(() => {
    const stored = loadString(VIEW_MODE_KEY, 'currency');
    return stored === 'country' ? 'country' : 'currency';
  });
  const [amount, setAmount] = useState<number>(100);
  const [currencyViewItems, setCurrencyViewItems] = useState<CurrencyItem[]>(() =>
    loadItem<CurrencyItem[]>(CURRENCY_TARGETS_KEY, defaultCurrencyTargets(loadString(BASE_CURRENCY_KEY, 'USD')))
  );
  const [countryViewItems, setCountryViewItems] = useState<CurrencyItem[]>(() => {
    const stored = loadItem<CurrencyItem[] | null>(COUNTRY_TARGETS_KEY, null);
    if (stored) return stored;
    return defaultCountryTargets(loadString(BASE_COUNTRY_KEY, 'United States'));
  });
  const [favouriteCurrencies, setfavouriteCurrencies] = useState<string[]>(() =>
    loadItem<string[]>(favourite_CURRENCIES_KEY, [])
  );

  const baseCurrency = useMemo(() => {
    if (viewMode === 'country') {
      return countriesByName[countryBase]?.currency_code || 'USD';
    }
    return currencyBase;
  }, [viewMode, currencyBase, countryBase]);

  const baseCountry = useMemo(() => {
    if (viewMode === 'country') {
      return countryBase;
    }
    return getDefaultCountryForCurrency(currencyBase);
  }, [viewMode, countryBase, currencyBase]);

  const currencyItems = useMemo(() => {
    return viewMode === 'country' ? countryViewItems : currencyViewItems;
  }, [viewMode, currencyViewItems, countryViewItems]);

  const amountRef = useRef(amount);
  const baseCountryRef = useRef(baseCountry);
  const viewModeRef = useRef(viewMode);

  useEffect(() => { amountRef.current = amount; }, [amount]);
  useEffect(() => { baseCountryRef.current = baseCountry; }, [baseCountry]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BASE_CURRENCY_KEY, currencyBase);
    } catch {}
  }, [currencyBase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BASE_COUNTRY_KEY, countryBase);
    } catch {}
  }, [countryBase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    } catch {}
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CURRENCY_TARGETS_KEY, JSON.stringify(currencyViewItems));
    } catch {}
  }, [currencyViewItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(COUNTRY_TARGETS_KEY, JSON.stringify(countryViewItems));
    } catch {}
  }, [countryViewItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(favourite_CURRENCIES_KEY, JSON.stringify(favouriteCurrencies));
    } catch {}
  }, [favouriteCurrencies]);

  const handleSetBaseCurrency = (currencyCode: string) => {
    setCurrencyBase(currencyCode);
  };

  const handleSetBaseCountry = (countryName: string) => {
    const country = countriesByName[countryName];
    if (!country) return;
    setCountryBase(countryName);
  };

  const handleSetViewMode = (mode: 'currency' | 'country') => {
    setViewMode(mode);
  };

  const addCurrencyItem = (item: CurrencyItemInput) => {
    const newItem: CurrencyItem = {
      ...item,
      id: `${item.country || item.code}-${Date.now()}`,
    };
    if (viewMode === 'country') {
      setCountryViewItems(prev => [...prev, newItem]);
    } else {
      setCurrencyViewItems(prev => [...prev, newItem]);
    }
  };

  const removeCurrencyItem = (id: string) => {
    if (viewMode === 'country') {
      setCountryViewItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCurrencyViewItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const togglefavourite = (id: string) => {
    const activeList = viewMode === 'country' ? countryViewItems : currencyViewItems;
    const item = activeList.find(i => i.id === id);
    const code = item?.code;
    if (code) {
      setfavouriteCurrencies(prev => {
        const set = new Set(prev);
        if (set.has(code)) set.delete(code);
        else set.add(code);
        return Array.from(set);
      });
    }
    const updater = (prev: CurrencyItem[]) =>
      prev.map(i =>
        i.id === id ? { ...i, isfavourite: !i.isfavourite } : i
      );
    if (viewMode === 'country') {
      setCountryViewItems(updater);
    } else {
      setCurrencyViewItems(updater);
    }
  };

  const updateCurrencyItem = async (id: string, newCode: string, currencyData: any, countryName?: string) => {
    if (!currencyData) return;

    const country = countryName ? countriesByName[countryName] : undefined;

    try {
      const response = await getLatestRates(baseCurrency);
      const rate = response.rates[newCode] ?? 1.0;
      const convertedAmount = amountRef.current * rate;
      const ppp = country ? country.ppp : undefined;
      const pppAmount = country
        ? computePPPAmount(amountRef.current, baseCountryRef.current, country.name, viewModeRef.current)
        : null;

      const updater = (prev: CurrencyItem[]) =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                code: currencyData.iso_code,
                name: currencyData.name,
                symbol: currencyData.symbol,
                country: country?.name,
                ppp,
                rate,
                convertedAmount,
                pppAmount
              }
            : item
        );

      if (viewModeRef.current === 'country') {
        setCountryViewItems(updater);
      } else {
        setCurrencyViewItems(updater);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);

      const updater = (prev: CurrencyItem[]) =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                code: currencyData.iso_code,
                name: currencyData.name,
                symbol: currencyData.symbol,
                country: country?.name,
                ppp: country ? country.ppp : undefined
              }
            : item
        );

      if (viewModeRef.current === 'country') {
        setCountryViewItems(updater);
      } else {
        setCurrencyViewItems(updater);
      }
    }
  };

  useEffect(() => {
    const updateAllRates = async () => {
      const currentView = viewModeRef.current;
      const currentAmount = amountRef.current;
      const currentBaseCountry = baseCountryRef.current;

      try {
        const response = await getLatestRates(baseCurrency);

        const updater = (prev: CurrencyItem[]) => {
          if (prev.length === 0) return prev;
          return prev.map(item => {
            const rate = response.rates[item.code] ?? 1.0;
            return {
              ...item,
              rate,
              convertedAmount: currentAmount * rate,
              pppAmount: computePPPAmount(currentAmount, currentBaseCountry, item.country, currentView)
            };
          });
        };

        if (currentView === 'country') {
          setCountryViewItems(updater);
        } else {
          setCurrencyViewItems(updater);
        }
      } catch (error) {
        console.error('Failed to update rates for base currency change:', error);
      }
    };

    void updateAllRates();
  }, [baseCurrency]);

  useEffect(() => {
    const isCountry = viewMode === 'country';

    const updater = (prev: CurrencyItem[]) =>
      prev.map(item => ({
        ...item,
        convertedAmount: amount * item.rate,
        pppAmount: computePPPAmount(amount, baseCountry, item.country, viewMode)
      }));

    if (isCountry) {
      setCountryViewItems(updater);
    } else {
      setCurrencyViewItems(updater);
    }
  }, [amount, baseCountry, viewMode]);

  return (
    <CurrencyContext.Provider value={{
      viewMode,
      setViewMode: handleSetViewMode,
      baseCurrency,
      setBaseCurrency: handleSetBaseCurrency,
      baseCountry,
      setBaseCountry: handleSetBaseCountry,
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
