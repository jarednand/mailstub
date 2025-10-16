import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app'
import { AppProvider } from '@/components/providers/app-provider'
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
      <Toaster />
    </AppProvider>
  </StrictMode>,
)