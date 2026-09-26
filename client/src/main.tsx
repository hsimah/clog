import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Theme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme theme={neutralTheme} mode="light">
      <App />
    </Theme>
  </StrictMode>,
)
