import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/atkinson-hyperlegible-next'
import './styles/noto-sans-latin.css'
import './styles/noto-sans-latin-ext.css'
import './styles/tokens.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
