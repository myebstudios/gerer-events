import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </HeroUIProvider>
  </StrictMode>,
);
