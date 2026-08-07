import { useState } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { POPULAR_CURRENCIES } from '../../data/currencies';
import { HeartIcon, HeartStraightIcon, XIcon, CaretDownIcon } from '@phosphor-icons/react';

interface CurrencyItemProps {
  id: string;
  code: string;
  name: string;
  symbol: string;
  convertedAmount: number;
  rate: number;
  isFavorite: boolean;
  availableCurrencies: any[];
  onCurrencyChange?: (newCode: string, currencyData: any) => void;
}

export default function CurrencyItem({
  id,
  code,
  name,
  symbol,
  convertedAmount,
  rate,
  isFavorite,
  availableCurrencies,
  onCurrencyChange
}: CurrencyItemProps) {
  const { removeCurrencyItem, toggleFavorite } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(code);

  // Split available currencies into popular and remaining for the dropdown
  const popularSet = new Set(POPULAR_CURRENCIES);
  const popularCurrencies = availableCurrencies.filter((c: any) => popularSet.has(c.iso_code));
  const otherCurrencies = availableCurrencies.filter((c: any) => !popularSet.has(c.iso_code));

  const handleRemove = () => {
    removeCurrencyItem(id);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(id);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCurrency(newCode);
    if (onCurrencyChange) {
      const currencyData = availableCurrencies.find((c: any) => c.iso_code === newCode);
      onCurrencyChange(newCode, currencyData);
    }
  };

  return (
    <div className="group bg-white rounded-4xl border border-[#EFE9DE] p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-ink font-display font-black text-xl">
            {symbol}
          </div>
          <div>
            <div className="font-black text-lg leading-tight">{convertedAmount.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{code} - {name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`cursor-pointer transition-colors text-xl ${isFavorite ? 'text-coral' : 'text-stone-300 hover:text-coral'}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <HeartStraightIcon weight="fill" /> : <HeartIcon />}
          </button>
          <button
            onClick={handleRemove}
            className="cursor-pointer text-stone-300 hover:text-red-500 transition-colors text-xl"
            title="Remove"
            aria-label="Remove currency"
          >
            <XIcon />
          </button>
        </div>
      </div>
      <div className="mt-8 pt-5 border-t border-[#EFE9DE] flex justify-between items-center">
        <span className="text-[10px] font-bold text-stone-400">1 USD = {rate} {symbol}</span>
        <div className="relative">
          <select
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            className="appearance-none bg-cream border border-stone-300 rounded-full px-3 py-1 pr-8 text-[10px] font-bold text-stone-600 hover:border-ink focus:outline-none focus:border-ink cursor-pointer"
            aria-label="Change currency"
          >
            <option value={code}>{code}</option>
            {/* Show popular currencies first, then the rest alphabetically */}
            {popularCurrencies.length > 0 && (
              <optgroup label="Popular">
                {popularCurrencies.map((currency: any) => (
                  <option key={currency.iso_code} value={currency.iso_code}>
                    {currency.iso_code}
                  </option>
                ))}
              </optgroup>
            )}
            {otherCurrencies.length > 0 && (
              <optgroup label="Currencies">
                {otherCurrencies.map((currency: any) => (
                  <option key={currency.iso_code} value={currency.iso_code}>
                    {currency.iso_code}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <CaretDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xs" weight="bold" />
        </div>
      </div>
    </div>
  );
}