import { memo, useEffect, useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { currenciesByCode, currenciesList } from '../data/currencies';
import { getCountryByName, countriesListSorted } from '../data/countries';
import { HeartIcon, HeartStraightIcon, XIcon, CaretDownIcon } from '@phosphor-icons/react';
import CurrencySelect from './CurrencySelect';
import CountrySelect from './CountrySelect';

// Format a number with up to 2 decimal places using the user's locale.
const formatNumber = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 });

// Props for an individual currency display item.
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
  // Global currency state and actions from context.
  const { viewMode, baseCurrency, baseCountry, removeCurrencyItem, togglefavourite, updateCurrencyItem, favouriteCurrencies } = useCurrency();

  // Local state mirrors the prop values so the select inputs stay controlled.
  const [selectedCurrency, setSelectedCurrency] = useState(code);
  const [selectedCountry, setSelectedCountry] = useState(country || '');

  // Keep local currency state in sync when the prop changes.
  useEffect(() => {
    setSelectedCurrency(code);
  }, [code]);

  // Keep local country state in sync when the prop changes.
  useEffect(() => {
    setSelectedCountry(country || '');
  }, [country]);

  // Remove this currency item from the list.
  const handleRemove = () => {
    removeCurrencyItem(id);
  };

  // Toggle this item's favourite status.
  const handleTogglefavourite = () => {
    togglefavourite(id);
  };

  // Handle switching to a different currency from the dropdown.
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCurrency(newCode);
    const currencyData = currenciesList.find((c) => c.iso_code === newCode);
    if (currencyData) {
      void updateCurrencyItem(id, newCode, currencyData);
    }
  };

  // Handle switching to a different country from the dropdown.
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    const countryData = getCountryByName(newCountry);
    if (!countryData) return;
    const currencyData = currenciesByCode[countryData.currency_code];
    if (!currencyData) return;
    void updateCurrencyItem(id, currencyData.iso_code, currencyData, countryData.name);
  };

  // Countries available for selection, excluding the currently selected base country.
  const availableCountries = countriesListSorted.filter((c) => c.name !== baseCountry);

  // Label shown under the converted amount; varies by country vs currency mode.
  const displayLabel = viewMode === 'country' && country ? `${country} (${code})` : `${code} - ${name}`;

  return (
    <div className="group bg-white dark:bg-surface rounded-4xl border border-[#EFE9DE] dark:border-stone-300 p-5 mx-0.5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
      {/* Top section: amount, label, and action buttons. */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3 w-full">
          {/* Currency symbol badge. */}
          <div className="w-12 h-12 rounded-2xl bg-cream dark:bg-ink flex items-center justify-center text-ink dark:text-cream font-display font-black text-xl">
            {symbol}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                {/* Converted amount and currency/country label. */}
                <div title={formatNumber(convertedAmount) } className="font-black text-lg leading-tight dark:text-cream truncate">{formatNumber(convertedAmount)}</div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate">{displayLabel}</div>
              </div>
              {/* PPP adjusted amount shown only in country view. */}
              {viewMode === 'country' && (
                <div className="flex-1 min-w-0">
                  <div title={pppAmount != null ? formatNumber(pppAmount) : 'N/A'} className="font-black text-lg leading-tight dark:text-cream truncate">
                    {pppAmount != null ? formatNumber(pppAmount) : 'N/A'}
                  </div>
                  <div className="text-[10px] font-bold text-coral uppercase tracking-widest truncate"><abbr title="Purchasing Power Parity">PPP</abbr> Adjusted</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Favourite and remove action buttons. */}
        <div className="flex items-center gap-2">
          {viewMode !== 'country' && (
            <button
              onClick={handleTogglefavourite}
              className={`cursor-pointer transition-colors text-xl ${isfavourite ? 'text-coral' : 'text-stone-300 hover:text-coral'}`}
              title={isfavourite ? 'Remove from favourites' : 'Add to favourites'}
              aria-label={isfavourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              {isfavourite ? <HeartStraightIcon weight="fill" /> : <HeartIcon />}
            </button>
          )}
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
      {/* Bottom section: exchange rate and selector dropdown. */}
      <div className="mt-4 pt-2 border-t border-[#EFE9DE] dark:border-stone-300 flex justify-between items-center">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest inline-flex flex-wrap items-baseline gap-x-1">
          1 {baseCurrency} = {formatNumber(rate)} {symbol}
          {/* PPP index shown only in country view when available. */}
          {viewMode === 'country' && ppp != null ? (
            <span className="whitespace-nowrap">
              · <abbr title="Purchasing Power Parity">PPP</abbr> Index: {formatNumber(ppp)}
            </span>
          ) : null}
        </span>
        <div className="relative">
          {/* Render CountrySelect in country view, otherwise CurrencySelect. */}
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
