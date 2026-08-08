import { useCurrency } from '../contexts/CurrencyContext';
import CurrencyItem from './CurrencyItem';
import { currenciesList, currenciesByCode } from '../data/currencies';
import { countriesListSorted, getCountryByName } from '../data/countries';
import type { CurrencyItemInput } from '../contexts/CurrencyContext';
import { getLatestRates } from '../api/currencyConversion';
import { PlusIcon } from '@phosphor-icons/react';

export default function ConversionSection() {
  const { viewMode, baseCountry, currencyItems, addCurrencyItem, baseCurrency, amount } = useCurrency();

  const handleAdd = async () => {
    if (viewMode === 'country') {
      const availableCountry = countriesListSorted.find(
        (c) => c.name !== baseCountry && !currencyItems.some((item) => item.country === c.name)
      );

      if (!availableCountry) return;

      const currencyData = currenciesByCode[availableCountry.currency_code];
      if (!currencyData) return;

      try {
        const response = await getLatestRates(baseCurrency);
        const rate = response.rates[currencyData.iso_code] ?? 1.0;
        const convertedAmount = amount * rate;

        const base = getCountryByName(baseCountry);
        const ppp = availableCountry.ppp;
        const pppAmount =
          base && base.ppp != null && ppp != null && base.ppp !== 0
            ? amount * (ppp / base.ppp)
            : null;

        const newItem: CurrencyItemInput = {
          code: currencyData.iso_code,
          name: currencyData.name,
          symbol: currencyData.symbol,
          convertedAmount,
          rate,
          isfavourite: false,
          country: availableCountry.name,
          ppp,
          pppAmount
        };

        addCurrencyItem(newItem);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }

      return;
    }

    const availableCurrency = currenciesList.find(
      (c: any) => c.iso_code !== baseCurrency && !currencyItems.some(item => item.code === c.iso_code)
    );

    if (!availableCurrency) return;

    try {
      const response = await getLatestRates(baseCurrency);
      const rate = response.rates[availableCurrency.iso_code] ?? 1.0;
      const convertedAmount = amount * rate;

      const newItem: CurrencyItemInput = {
        code: availableCurrency.iso_code,
        name: availableCurrency.name,
        symbol: availableCurrency.symbol,
        convertedAmount,
        rate,
        isfavourite: false
      };

      addCurrencyItem(newItem);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    }
  };

  return (
    <section id="conversions-grid" className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display font-extrabold text-2xl tracking-tight dark:text-cream">Around the world, that's...</h2>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-white dark:bg-surface border border-stone-300 dark:border-stone-300 rounded-full text-xs font-bold dark:text-stone-500 flex items-center gap-2 hover:border-ink dark:hover:border-cream dark:hover:text-cream transition-colors"
            aria-label={viewMode === 'country' ? 'Add country' : 'Add currency'}
          >
            <PlusIcon /> {viewMode === 'country' ? 'Add Country' : 'Add Currency'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currencyItems.map(item => (
          <CurrencyItem
            key={item.id}
            id={item.id}
            code={item.code}
            name={item.name}
            symbol={item.symbol}
            convertedAmount={item.convertedAmount}
            rate={item.rate}
            isfavourite={item.isfavourite}
            country={item.country}
            ppp={item.ppp}
            pppAmount={item.pppAmount}
          />
        ))}

        {/* Add New Card */}
        <button
          onClick={handleAdd}
          className="group h-full w-full bg-white dark:bg-surface border-2 border-dashed border-stone-300 dark:border-stone-300 rounded-4xl p-5 mx-0.5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-stone-400 dark:text-stone-400 hover:border-ink dark:hover:border-cream hover:text-ink dark:hover:text-cream"
          aria-label={viewMode === 'country' ? 'Add another country' : 'Add another currency'}
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 dark:bg-ink flex items-center justify-center group-hover:bg-yolk dark:group-hover:bg-yolk group-hover:text-ink dark:group-hover:text-ink transition-colors">
            <PlusIcon weight="bold" className="text-2xl" />
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-md">Add Another</div>
            <p className="text-xs">{viewMode === 'country' ? 'Countries await' : 'Curiosity has no limits'}</p>
          </div>
        </button>
      </div>
    </section>
  );
}
