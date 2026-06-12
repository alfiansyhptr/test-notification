import { getToken } from "firebase/messaging";
import { messaging, firebaseConfig } from "../config/firebase";

export const getFCMToken = async () => {
  try {
    const msg = await messaging();
    if (!msg) {
      console.warn("Messaging not supported.");
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn("Service workers are not supported in this browser.");
      return null;
    }

    // Register service worker with config to avoid hardcoding in sw file
    const config = encodeURIComponent(JSON.stringify(firebaseConfig));
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?config=${config}`
    );

    const token = await getToken(msg, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Token generated:", token);
      return token;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};
