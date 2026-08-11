import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { initDatabase } from '@/database/sqlite';
import { initFileStorage } from '@/services/file.service';

const BOOTSTRAP_TIMEOUT_MS = 20_000;

let bootstrapPromise: Promise<void> | null = null;

async function configureNativeChrome() {
  await SystemBars.setStyle({ style: SystemBarsStyle.Light });

  const { SplashScreen } = await import('@capacitor/splash-screen');
  const { App } = await import('@capacitor/app');
  const { StatusBar, Style } = await import('@capacitor/status-bar');

  if (Capacitor.getPlatform() === 'android') {
    await StatusBar.setOverlaysWebView({ overlay: false }).catch(() => undefined);

    const info = await StatusBar.getInfo();
    if (info.height > 0) {
      document.documentElement.style.setProperty(
        '--safe-area-inset-top',
        `${info.height}px`,
      );
    }
  } else {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#F7F7F8' });
  }

  await SplashScreen.hide();

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else App.exitApp();
  });
}

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
        await configureNativeChrome();
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
