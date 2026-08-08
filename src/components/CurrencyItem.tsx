import { memo, useEffect, useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { currenciesByCode, currenciesList } from '../data/currencies';
import { getCountryByName, countriesListSorted } from '../data/countries';
import { HeartIcon, HeartStraightIcon, XIcon, CaretDownIcon } from '@phosphor-icons/react';
import CurrencySelect from './CurrencySelect';
import CountrySelect from './CountrySelect';

interface CurrencyItemProps {
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

function CurrencyItem({
  id,
  code,
  name,
  symbol,
  convertedAmount,
  rate,
  isfavourite,
  country,
  ppp,
  pppAmount
}: CurrencyItemProps) {
  const { viewMode, baseCurrency, baseCountry, removeCurrencyItem, togglefavourite, updateCurrencyItem, favouriteCurrencies } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(code);
  const [selectedCountry, setSelectedCountry] = useState(country || '');

  useEffect(() => {
    setSelectedCurrency(code);
  }, [code]);

  useEffect(() => {
    setSelectedCountry(country || '');
  }, [country]);

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
      void updateCurrencyItem(id, newCode, currencyData);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    const countryData = getCountryByName(newCountry);
    if (!countryData) return;
    const currencyData = currenciesByCode[countryData.currency_code];
    if (!currencyData) return;
    void updateCurrencyItem(id, currencyData.iso_code, currencyData, countryData.name);
  };

  const availableCountries = countriesListSorted.filter((c) => c.name !== baseCountry);

  const displayLabel = viewMode === 'country' && country ? `${country}` : `${code} - ${name}`;

  return (
    <div className="group bg-white dark:bg-surface rounded-4xl border border-[#EFE9DE] dark:border-stone-300 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3 w-full">
          <div className="w-12 h-12 rounded-2xl bg-cream dark:bg-ink flex items-center justify-center text-ink dark:text-cream font-display font-black text-xl">
            {symbol}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <div className="font-black text-lg leading-tight dark:text-cream">{convertedAmount.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate">{displayLabel}</div>
              </div>
              {viewMode === 'country' && (
                <div className="flex-1 min-w-0">
                  <div className="font-black text-lg leading-tight dark:text-cream">
                    {pppAmount != null ? pppAmount.toLocaleString() : 'N/A'}
                  </div>
                  <div className="text-[10px] font-bold text-coral uppercase tracking-widest truncate">PPP {code}</div>
                </div>
              )}
            </div>
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
      <div className="mt-8 pt-5 border-t border-[#EFE9DE] dark:border-stone-300 flex justify-between items-center">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          1 {baseCurrency} = {rate} {symbol}
          {viewMode === 'country' && ppp != null ? ` · PPP ${ppp}` : ''}
        </span>
        <div className="relative">
          {viewMode === 'country' ? (
            <CountrySelect
              value={selectedCountry}
              onChange={handleCountryChange}
              ariaLabel="Change country"
              showFullLabel
              countries={availableCountries.map((c) => c.name)}
              className="appearance-none bg-cream dark:bg-ink border border-stone-300 dark:border-stone-300 rounded-full px-3 py-1 pr-8 text-[10px] font-bold text-stone-500 hover:border-ink dark:hover:border-cream focus:outline-none focus:border-ink dark:focus:border-cream cursor-pointer"
            />
          ) : (
            <CurrencySelect
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              ariaLabel="Change currency"
              currencies={currenciesList.filter((c) => c.iso_code !== baseCurrency)}
              favourites={favouriteCurrencies}
              className="appearance-none bg-cream dark:bg-ink border border-stone-300 dark:border-stone-300 rounded-full px-3 py-1 pr-8 text-[10px] font-bold text-stone-500 hover:border-ink dark:hover:border-cream focus:outline-none focus:border-ink dark:focus:border-cream cursor-pointer"
            />
          )}
          <CaretDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none text-xs" weight="bold" />
        </div>
      </div>
    </div>
  );
}

export default memo(CurrencyItem);
