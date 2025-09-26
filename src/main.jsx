import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App'
import { SipProvider } from './context/SipContext';

const rootEl = document.getElementById('root')
createRoot(rootEl).render(
  <StrictMode>
    <SipProvider>
      <App />
    </SipProvider>
  </StrictMode>
)
