import OneSignal from 'onesignal-cordova-plugin';
import { UserProfile } from '../types';

export const initOneSignal = async (userProfile: UserProfile | null) => {
  if (!userProfile) return;

  // 1. Configuração para Web/PWA
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as Window & typeof globalThis & { OneSignal: any };
  if (typeof window !== 'undefined' && win.OneSignal) {
    const initOneSignalWeb = async () => {
      try {
        const os = win.OneSignal;
        
        // If OneSignal is an array, it's the queue, push the init function
        if (Array.isArray(os)) {
          os.push(async () => {
            await win.OneSignal.init({
              appId: "fc5b9356-be51-4ada-a155-01ea7ac6e5b8", 
              allowLocalhostAsSecureOrigin: true,
            });
            if (userProfile?.uid) {
              await win.OneSignal.login(userProfile.uid);
            }
          });
        } else {
          // Already initialized
          await os.init({
            appId: "fc5b9356-be51-4ada-a155-01ea7ac6e5b8", 
            allowLocalhostAsSecureOrigin: true,
          });
          if (userProfile?.uid) {
            await os.login(userProfile.uid);
          }
        }
      } catch (initError: unknown) {
        const error = initError as Error;
        if (error?.message?.includes("SDK already initialized")) {
          console.log("OneSignal: SDK already initialized, skipping.");
        } else if (error?.message?.includes("Can only be used on")) {
          console.warn("OneSignal: Configuration error for this origin, skipping.", error.message);
        } else {
          console.error("Error initializing OneSignal Web:", error);
        }
      }
    };

    initOneSignalWeb();
  }

  // 2. Configuração para Capacitor (Android/iOS)
  // Nota: Isso só roda dentro do app nativo
  try {
    if (OneSignal && typeof OneSignal.initialize === 'function') {
      OneSignal.initialize("fc5b9356-be51-4ada-a155-01ea7ac6e5b8"); 
      
      if (userProfile.uid) {
        OneSignal.login(userProfile.uid);
      }

      OneSignal.Notifications.requestPermission(true).then((success: boolean) => {
        console.log("Notification permission status:", success);
      });
    }
  } catch (e) {
    // Silently fail if not in a native environment
    console.log("Capacitor OneSignal not available or failed to initialize");
  }
};
