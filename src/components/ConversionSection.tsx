import { useCurrency } from '../contexts/CurrencyContext';
import CurrencyItem from './CurrencyItem';
import { currenciesList } from '../data/currencies';
import type { CurrencyItemInput } from '../contexts/CurrencyContext';
import { getLatestRates } from '../api/currencyConversion';
import { PlusIcon } from '@phosphor-icons/react';

export default function ConversionSection() {
  const { currencyItems, addCurrencyItem, baseCurrency, amount } = useCurrency();

  const handleAddCurrency = async () => {
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
        <h2 className="font-display font-extrabold text-2xl tracking-tight">Around the world, that's...</h2>
        <div className="flex gap-2">
          <button
            onClick={handleAddCurrency}
            className="px-4 py-2 bg-white border border-stone-300 rounded-full text-xs font-bold flex items-center gap-2 hover:border-ink transition-colors"
            aria-label="Add currency"
          >
            <PlusIcon /> Add Currency
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
          />
        ))}

        {/* Add New Card */}
        <button
          onClick={handleAddCurrency}
          className="group border-2 border-dashed border-stone-300 rounded-4xl p-7 flex flex-col items-center justify-center gap-4 hover:border-ink hover:bg-white transition-all text-stone-400 hover:text-ink"
          aria-label="Add another currency"
        >
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-yolk transition-colors">
            <PlusIcon weight="bold" className="text-2xl" />
          </div>
          <div className="text-center">
            <div className="font-display font-bold">Add Another</div>
            <p className="text-xs">Curiosity has no limits</p>
          </div>
        </button>
      </div>
    </section>
  );
}