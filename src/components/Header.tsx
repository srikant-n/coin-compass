import { useCurrency } from "../contexts/CurrencyContext";
import Logo from "./Logo";

export default function Header() {
  const { viewMode, setViewMode } = useCurrency();

  return (
    <header id="header" className="w-full px-8 py-6 flex justify-between gap-3 items-center max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Logo size={40}/>  
        <h1 className="font-display font-extrabold text-2xl tracking-tight dark:text-cream">Coin Compass<span className="hidden md:inline"> - Explore Currencies</span></h1>
      </div>
      <div className="flex items-center bg-white dark:bg-surface border border-stone-300 dark:border-stone-300 rounded-full p-1" role="group" aria-label="View mode">
        <button
          onClick={() => setViewMode('currency')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
            viewMode === 'currency'
              ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
              : 'text-stone-500 hover:text-ink dark:hover:text-cream'
          }`}
          aria-pressed={viewMode === 'currency'}
        >
          Currency
        </button>
        <button
          onClick={() => setViewMode('country')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
            viewMode === 'country'
              ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
              : 'text-stone-500 hover:text-ink dark:hover:text-cream'
          }`}
          aria-pressed={viewMode === 'country'}
        >
          Country
        </button>
      </div>
    </header>
  );
}