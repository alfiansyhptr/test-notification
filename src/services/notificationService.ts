import { onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";

export const onForegroundMessage = async (callback: (payload: any) => void) => {
  try {
    const msg = await messaging();
    if (!msg) return null;

    return onMessage(msg, (payload) => {
      console.log("Message received in foreground: ", payload);
      callback(payload);
    });
  } catch (error) {
    console.error("Failed to initialize foreground message listener", error);
    return null;
  }
};
