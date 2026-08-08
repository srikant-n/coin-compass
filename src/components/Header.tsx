
import Logo from "./Logo";

export default function Header() {
  return (
    <header id="header" className="w-full px-8 py-6 flex justify-start gap-3 items-center max-w-6xl mx-auto">
      <Logo size={40}/>  
      <h1 className="font-display font-extrabold text-2xl tracking-tight">Coin Compass - Explore Currencies</h1>
     </header>
  );
}