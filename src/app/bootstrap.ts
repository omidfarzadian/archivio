import { Capacitor } from '@capacitor/core';
import { initDatabase } from '@/database/sqlite';
import { initFileStorage } from '@/services/file.service';

const BOOTSTRAP_TIMEOUT_MS = 20_000;

let bootstrapPromise: Promise<void> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function bootstrapApp(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = withTimeout(
    (async () => {
      await initDatabase();
      await initFileStorage();

      if (Capacitor.isNativePlatform()) {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        const { SplashScreen } = await import('@capacitor/splash-screen');
        const { App } = await import('@capacitor/app');

        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#F7F7F8' });
        await SplashScreen.hide();

        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else App.exitApp();
        });
      }
    })(),
    BOOTSTRAP_TIMEOUT_MS,
    'App initialization timed out. Please reload the page.',
  ).catch((err) => {
    bootstrapPromise = null;
    throw err;
  });

  return bootstrapPromise;
}
