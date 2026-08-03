import { useEffect } from 'react'
import './App.css'
import Header from './components/Header'

function App() {

  // Apply background styles to body element
  useEffect(() => {
    document.body.className = 'bg-cream dark:bg-ink text-ink dark:text-cream font-sans antialiased dotgrid dark:dotgrid';
    
    return () => {
      document.body.className = ''
    }
  }, [])

  return (
      <Header />

  )
}

export default App
