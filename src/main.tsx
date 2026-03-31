import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || "https://example.convex.cloud");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <AuthProvider>
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      </AuthProvider>
    </HeroUIProvider>
  </StrictMode>,
);
