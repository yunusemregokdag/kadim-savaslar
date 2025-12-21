import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log("Details: Starting index.tsx execution");

const rootElement = document.getElementById('root');

// CRASH REPORTING UTIL
const reportCrash = (error: any) => {
  console.error("CRASH:", error);
  const crashDiv = document.createElement('div');
  crashDiv.style.position = 'fixed';
  crashDiv.style.top = '0';
  crashDiv.style.left = '0';
  crashDiv.style.width = '100%';
  crashDiv.style.height = '100%';
  crashDiv.style.backgroundColor = 'rgba(0,0,0,0.9)';
  crashDiv.style.color = '#ff5555';
  crashDiv.style.padding = '20px';
  crashDiv.style.zIndex = '9999';
  crashDiv.style.overflow = 'auto';
  crashDiv.style.whiteSpace = 'pre-wrap';
  crashDiv.style.fontFamily = 'monospace';
  crashDiv.innerHTML = `<h1>GAME CRASHED</h1><p>${error?.message || error}</p><pre>${error?.stack || ''}</pre>`;
  document.body.appendChild(crashDiv);
};

window.onerror = (message, source, lineno, colno, error) => {
  reportCrash(error || message);
};

if (!rootElement) {
  console.error("Details: Root element not found!");
  throw new Error("Could not find root element to mount to");
} else {
  console.log("Details: Root element found:", rootElement);
}

// import { StatusBar } from '@capacitor/status-bar';
// import { ScreenOrientation } from '@capacitor/screen-orientation';
// import { App as CapApp } from '@capacitor/app';

// Native Mobile Initialization
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    console.log("Details: AppInitializer mounted");

    // const initNativeer = async () => {
    //   try {
    //     // 1. Hide Status Bar for Fullscreen
    //     await StatusBar.hide();
    //   } catch (e) {
    //     console.log("Status bar hide failed (not mobile?)", e);
    //   }

    //   try {
    //     // 2. Lock to Landscape
    //     await ScreenOrientation.lock({ orientation: 'landscape' });
    //   } catch (e) {
    //     console.log("Orientation lock failed", e);
    //   }

    //   // 3. Handle Back Button (Exit app on root)
    //   CapApp.addListener('backButton', ({ canGoBack }) => {
    //     if (!canGoBack) {
    //       CapApp.exitApp();
    //     } else {
    //       window.history.back();
    //     }
    //   });
    // };

    // initNativeer();
  }, []);

  return <>{children}</>;
};

import { AuthProvider } from './contexts/AuthContext';

import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(rootElement);
console.log("Details: Rendering root");

// Placeholder Client ID - Kendi ID'nizi alınca burayı değiştirin veya .env'e koyun
// Örn: import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = "BURAYA_GOOGLE_CLIENT_ID_GELECEK";

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppInitializer>
        <App />
      </AppInitializer>
    </GoogleOAuthProvider>
  </React.StrictMode>
);