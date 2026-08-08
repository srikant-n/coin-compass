import { memo, useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { currenciesList } from '../data/currencies';
import { HeartIcon, HeartStraightIcon, XIcon, CaretDownIcon } from '@phosphor-icons/react';
import CurrencySelect from './CurrencySelect';

interface CurrencyItemProps {
  id: string;
  code: string;
  name: string;
  symbol: string;
  convertedAmount: number;
  rate: number;
  isfavourite: boolean;
}

function CurrencyItem({
  id,
  code,
  name,
  symbol,
  convertedAmount,
  rate,
  isfavourite
}: CurrencyItemProps) {
  const { baseCurrency, removeCurrencyItem, togglefavourite, updateCurrencyItem, favouriteCurrencies } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(code);

  const handleRemove = () => {
    removeCurrencyItem(id);
  };

  const handleTogglefavourite = () => {
    togglefavourite(id);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCurrency(newCode);
    const currencyData = currenciesList.find((c) => c.iso_code === newCode);
    if (currencyData) {
      updateCurrencyItem(id, newCode, currencyData);
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
            onClick={handleTogglefavourite}
            className={`cursor-pointer transition-colors text-xl ${isfavourite ? 'text-coral' : 'text-stone-300 hover:text-coral'}`}
            title={isfavourite ? 'Remove from favourites' : 'Add to favourites'}
            aria-label={isfavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            {isfavourite ? <HeartStraightIcon weight="fill" /> : <HeartIcon />}
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
        <span className="text-[10px] font-bold text-stone-400">1 {baseCurrency} = {rate} {symbol}</span>
        <div className="relative">
          <CurrencySelect
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            ariaLabel="Change currency"
            currencies={currenciesList.filter((c) => c.iso_code !== baseCurrency)}
            favourites={favouriteCurrencies}
            className="appearance-none bg-cream border border-stone-300 rounded-full px-3 py-1 pr-8 text-[10px] font-bold text-stone-600 hover:border-ink focus:outline-none focus:border-ink cursor-pointer"
          />
          <CaretDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xs" weight="bold" />
        </div>
      </div>
    </div>
  );
}

export default memo(CurrencyItem);
