import { useCurrency } from '../contexts/CurrencyContext';
import { currenciesByCode, currenciesList } from '../data/currencies';
import { countriesByName } from '../data/countries';
import { CaretDownIcon } from '@phosphor-icons/react';
import CurrencySelect from './CurrencySelect';
import CountrySelect from './CountrySelect';

export function BaseCurrency() {
  const { viewMode, baseCurrency, baseCountry, amount, setAmount, setBaseCurrency, setBaseCountry, favouriteCurrencies } = useCurrency();
  const currency = currenciesByCode[baseCurrency];
  const country = countriesByName[baseCountry];

  return (
    <section id="converter-base" aria-labelledby="base-currency-heading" className="w-full max-w-2xl text-center mb-16 mx-auto">
      <p id="base-currency-heading" className="text-xs font-bold text-coral tracking-widest uppercase mb-4 italic">I have exactly...</p>

      <div className="relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-coral via-yolk to-matcha rounded-[40px] opacity-20 dark:opacity-10 blur-lg group-hover:opacity-40 dark:group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-white dark:bg-surface border border-[#EFE9DE] dark:border-stone-300 rounded-[36px] p-4 md:p-8 mx-2 shadow-[0_20px_50px_rgba(44,38,33,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2">

            {/* Amount */}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              aria-label="Enter amount"
              className="w-full bg-transparent border-b focus:border-b-2 focus:border-stone-700 border-stone-300 dark:border-none text-center font-display font-black text-5xl md:text-6xl focus:ring-0 text-ink dark:text-cream placeholder-stone-300 dark:placeholder-stone-400 focus:outline-0 no-spinners"
            />

            {/* Currency / Country Select */}
            <div className="relative">
              {viewMode === 'country' ? (
                <CountrySelect
                  value={baseCountry}
                  onChange={(e) => setBaseCountry(e.target.value)}
                  ariaLabel="Select base country"
                  showFullLabel
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none bg-cream dark:bg-ink border border-stone-300 dark:border-stone-300 rounded-full px-3 py-1 pr-8 text-[10px] font-bold text-stone-600 dark:text-stone-500 hover:border-ink dark:hover:border-cream focus:outline-none focus:border-ink dark:focus:border-cream"
                />
              ) : (
                <CurrencySelect
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  ariaLabel="Select base currency"
                  currencies={currenciesList}
                  showFullLabel
                  favourites={favouriteCurrencies}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none bg-cream dark:bg-ink border border-stone-300 dark:border-stone-300 rounded-full px-3 py-1 pr-8 text-[10px] font-bold text-stone-600 dark:text-stone-500 hover:border-ink dark:hover:border-cream focus:outline-none focus:border-ink dark:focus:border-cream"
                />
              )}
              <div aria-hidden="true" className="flex items-center gap-2 bg-cream dark:bg-ink border border-stone-300 dark:border-stone-300 rounded-3xl p-2 hover:bg-stone-300/10 dark:hover:bg-stone-300 transition-colors pointer-events-none">
                <span className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-ink dark:bg-cream text-cream dark:text-ink flex items-center justify-center font-display font-bold text-md md:text-xl">{currency?.symbol || '$'}</span>
                <div className="font-black text-md md:text-xl leading-none dark:text-cream max-w-24 md:max-w-32 truncate">{baseCurrency}</div>
                <CaretDownIcon weight="bold" className="text-stone-500 ml-2" />
              </div>
            </div>
          </div>
          {currency.name && <p className="md:absolute md:bottom-2 md:right-6 text-[10px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-widest mt-1">{viewMode === 'country' ? `${country?.name || baseCountry} · ${baseCurrency}` : baseCurrency} = {currency.name}</p>}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          onClick={() => setAmount(50)}
          aria-label={`Set amount to ${currency?.symbol || '$'}50`}
          className="px-4 py-1.5 rounded-full bg-white dark:bg-surface border border-stone-300 dark:border-stone-300 text-[11px] font-bold dark:text-stone-500 hover:border-ink dark:hover:border-cream hover:text-ink dark:hover:text-cream transition-colors"
        >
          Quick: {currency?.symbol || '$'}50
        </button>
        <button
          onClick={() => setAmount(1000)}
          aria-label={`Set amount to ${currency?.symbol || '$'}1,000`}
          className="px-4 py-1.5 rounded-full bg-white dark:bg-surface border border-stone-300 dark:border-stone-300 text-[11px] font-bold dark:text-stone-500 hover:border-ink dark:hover:border-cream hover:text-ink dark:hover:text-cream transition-colors"
        >
          Quick: {currency?.symbol || '$'}1,000
        </button>
        <button
          onClick={() => setAmount(Math.ceil(amount / 100) * 100)}
          aria-label="Round up amount to nearest hundred"
          className="px-4 py-1.5 rounded-full bg-white dark:bg-surface border border-stone-300 dark:border-stone-300 text-[11px] font-bold dark:text-stone-500 hover:border-ink dark:hover:border-cream hover:text-ink dark:hover:text-cream transition-colors"
        >
          Round Up
        </button>
      </div>
    </section>
  );
}  
