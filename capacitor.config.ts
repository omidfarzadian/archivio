import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mava.app',
  appName: 'ماوا',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#F7F7F8',
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'LIGHT',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6D4AFF',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#F7F7F8',
      overlaysWebView: false,
    },
    CapacitorSQLite: {
      androidIsEncryption: false,
      iosIsEncryption: false,
    },
  },
};

export default config;
