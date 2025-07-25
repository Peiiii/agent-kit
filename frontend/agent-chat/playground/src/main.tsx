import { ThemeProvider } from 'composite-kit'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

import './index.css'

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
