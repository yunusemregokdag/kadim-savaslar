import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kadimsavaslar.app',
  appName: 'KadimSavaslar',
  webDir: 'dist',
  // Production mode - load from built assets
  // For development with live reload, uncomment server block below:
  // server: {
  //   url: 'http://YOUR_LOCAL_IP:5173',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false, // Disable for production
  },
};

export default config;
