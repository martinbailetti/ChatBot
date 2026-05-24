import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n/index'
import './index.css'

// Registrar / desregistrar service worker
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Falla silenciosa; la app funciona sin SW
      })
    })
  } else {
    // En desarrollo, desregistrar SWs previos para evitar problemas con HMR
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister())
    })
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
