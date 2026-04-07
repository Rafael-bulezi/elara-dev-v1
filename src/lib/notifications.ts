import OneSignal from 'onesignal-cordova-plugin';

export const initOneSignal = async (userProfile: any) => {
  // 1. Configuração para Web/PWA
  if (typeof window !== 'undefined' && (window as any).OneSignal) {
    const OneSignalWeb = (window as any).OneSignal;
    
    await OneSignalWeb.init({
      appId: "fc5b9356-be51-4ada-a155-01ea7ac6e5b8", 
      allowLocalhostAsSecureOrigin: true,
    });

    if (userProfile?.uid) {
      await OneSignalWeb.login(userProfile.uid);
    }
  }

  // 2. Configuração para Capacitor (Android/iOS)
  // Nota: Isso só roda dentro do app nativo
  try {
    OneSignal.initialize("fc5b9356-be51-4ada-a155-01ea7ac6e5b8"); 
    
    if (userProfile?.uid) {
      OneSignal.login(userProfile.uid);
    }

    OneSignal.Notifications.requestPermission(true).then((success: boolean) => {
      console.log("Notification permission status:", success);
    });
  } catch (e) {
    console.log("Capacitor OneSignal not available in web browser");
  }
};
