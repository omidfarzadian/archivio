import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.archivio.app',
  appName: 'Archivio',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#F7F7F8',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6D4AFF',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#F7F7F8',
    },
  },
};

export default config;
