import { useMemo } from 'react';
import { countriesListSorted } from '../data/countries';
import type { Country } from '../data/countries';

// Props for rendering a searchable/selectable list of countries.
interface CountrySelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  ariaLabel: string;
  className?: string;
  showFullLabel?: boolean;
  countries?: string[];
}

export default function CountrySelect({
  value,
  onChange,
  ariaLabel,
  className = '',
  showFullLabel = false,
  countries
}: CountrySelectProps) {
  // Filter the full country list to the allowed subset, if one was provided.
  const options = useMemo(() => {
    const allowed = new Set(countries);
    return countries && countries.length > 0
      ? countriesListSorted.filter((c) => allowed.has(c.name))
      : countriesListSorted;
  }, [countries]);

  // Display either the country name or "Name (Currency)" depending on context.
  const label = (country: Country) =>
    showFullLabel ? `${country.name} (${country.currency_code})` : country.name;

  return (
    <select value={value} onChange={onChange} aria-label={ariaLabel} className={className}>
      <optgroup label="Countries">
        {options.map((country) => (
          <option key={country.name} value={country.name}>
            {label(country)}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
