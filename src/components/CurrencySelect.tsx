import { useMemo } from 'react';
import { POPULAR_CURRENCIES } from '../data/currencies';
import type { Currency } from '../data/currencies';

// Props for rendering a searchable/selectable list of currencies.
interface CurrencySelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  currencies: Currency[];
  ariaLabel: string;
  className?: string;
  showFullLabel?: boolean;
  favourites?: string[];
}

export default function CurrencySelect({
  value,
  onChange,
  currencies,
  ariaLabel,
  className = '',
  showFullLabel = false,
  favourites = []
}: CurrencySelectProps) {
  // Lookup sets and maps used to partition the currency list efficiently.
  const popularSet = useMemo(() => new Set(POPULAR_CURRENCIES), []);
  const favouritesSet = useMemo(() => new Set(favourites), [favourites]);
  const currencyByCode = useMemo(
    () => new Map(currencies.map((c) => [c.iso_code, c])),
    [currencies]
  );

  // Split currencies into favourites, popular, and the rest for grouped rendering.
  const favouriteCurrencies = useMemo(
    () => favourites.map((code) => currencyByCode.get(code)).filter((c): c is Currency => !!c),
    [favourites, currencyByCode]
  );
  const popularCurrencies = useMemo(
    () => currencies.filter((c) => !favouritesSet.has(c.iso_code) && popularSet.has(c.iso_code)),
    [currencies, favouritesSet, popularSet]
  );
  const otherCurrencies = useMemo(
    () => currencies.filter((c) => !favouritesSet.has(c.iso_code) && !popularSet.has(c.iso_code)),
    [currencies, favouritesSet, popularSet]
  );

  // Render either the ISO code alone or the full "Code - Name (Symbol)" label.
  const label = (currency: Currency) =>
    showFullLabel
      ? `${currency.iso_code} - ${currency.name} (${currency.symbol})`
      : currency.iso_code;

  return (
    <select
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className={className}
    >
      {/* Favourites first, if any exist. */}
      {favouriteCurrencies.length > 0 && (
        <optgroup label="favourites">
          {favouriteCurrencies.map((currency) => (
            <option key={currency.iso_code} value={currency.iso_code}>
              {label(currency)}
            </option>
          ))}
        </optgroup>
      )}
      {/* Next, the most commonly used currencies. */}
      {popularCurrencies.length > 0 && (
        <optgroup label="Popular">
          {popularCurrencies.map((currency) => (
            <option key={currency.iso_code} value={currency.iso_code}>
              {label(currency)}
            </option>
          ))}
        </optgroup>
      )}
      {/* Finally, all remaining currencies. */}
      {otherCurrencies.length > 0 && (
        <optgroup label="Currencies">
          {otherCurrencies.map((currency) => (
            <option key={currency.iso_code} value={currency.iso_code}>
              {label(currency)}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
