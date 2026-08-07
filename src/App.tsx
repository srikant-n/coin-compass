import { useEffect } from 'react'
import './App.css'
import Header from './components/minor/Header'
import { BaseCurrency } from './components/major/BaseCurrency';
import ConversionSection from './components/major/ConversionSection';
import { CurrencyProvider } from './contexts/CurrencyContext';

function App() {

  // Apply background styles to body element
  useEffect(() => {
    document.body.className = 'bg-cream dark:bg-ink text-ink dark:text-cream font-sans antialiased dotgrid dark:dotgrid';
    
    return () => {
      document.body.className = ''
    }
  }, [])

  return (
    <CurrencyProvider>
      <Header />
      <BaseCurrency />
      <ConversionSection />
    </CurrencyProvider>
  )
}

export default App
