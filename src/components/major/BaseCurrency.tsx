import { useCurrency } from '../../contexts/CurrencyContext';
import { currenciesByCode } from '../../data/currencies';
import currencies from '../../data/currencies.json';

export function BaseCurrency() {
  const { baseCurrency, amount, setAmount, setBaseCurrency } = useCurrency();
  const currency = currenciesByCode[baseCurrency];

  return (
    <section id="converter-base" aria-labelledby="base-currency-heading" className="w-full max-w-2xl text-center mb-16 mx-auto">
      <p id="base-currency-heading" className="text-xs font-bold text-coral tracking-widest uppercase mb-4 italic">I have exactly...</p>

      <div className="relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-coral via-yolk to-matcha rounded-[40px] opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
        <div className="relative bg-white border border-[#EFE9DE] rounded-[36px] p-4 md:p-8 mx-2 shadow-[0_20px_50px_rgba(44,38,33,0.06)]">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2">

            {/* Amount */}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              aria-label="Enter amount"
              className="w-full bg-transparent border-b focus:border-b-2 focus:border-stone-700 border-stone-300 text-center font-display font-black text-5xl md:text-6xl focus:ring-0 text-ink placeholder-stone-300 focus:outline-0"
            />

            {/* Currency Select */}
            <div className="relative">
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                aria-label="Select base currency"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              >
                {currencies.map((curr: any) => (
                  <option key={curr.iso_code} value={curr.iso_code}>
                    {curr.iso_code} - {curr.name} ({curr.symbol} )
                  </option>
                ))}
              </select>
              <div aria-hidden="true" className="flex items-center gap-2 bg-cream border border-stone-300 rounded-3xl p-2 hover:bg-stone-300/10 transition-colors pointer-events-none">
                <span className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-ink text-cream flex items-center justify-center font-display font-bold text-md md:text-xl">{currency?.symbol || '$'}</span>
                <div className="font-black text-md md:text-xl leading-none">{baseCurrency}</div>
                <i className="ph-bold ph-caret-down text-stone-500 ml-2"></i>
              </div>
            </div>
          </div>
          {currency.name && <p className="md:absolute md:bottom-2 md:right-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">{baseCurrency} = {currency.name}</p>}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          onClick={() => setAmount(50)}
          aria-label={`Set amount to ${currency?.symbol || '$'}50`}
          className="px-4 py-1.5 rounded-full bg-white border border-stone-300 text-[11px] font-bold hover:border-ink transition-colors"
        >
          Quick: {currency?.symbol || '$'}50
        </button>
        <button
          onClick={() => setAmount(1000)}
          aria-label={`Set amount to ${currency?.symbol || '$'}1,000`}
          className="px-4 py-1.5 rounded-full bg-white border border-stone-300 text-[11px] font-bold hover:border-ink transition-colors"
        >
          Quick: {currency?.symbol || '$'}1,000
        </button>
        <button
          onClick={() => setAmount(Math.ceil(amount / 100) * 100)}
          aria-label="Round up amount to nearest hundred"
          className="px-4 py-1.5 rounded-full bg-white border border-stone-300 text-[11px] font-bold hover:border-ink transition-colors"
        >
          Round Up
        </button>
      </div>
    </section>
  );
}  