import { onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";

export const onForegroundMessage = async (callback: (payload: any) => void) => {
  try {
    const msg = await messaging();
    if (!msg) return null;

    return onMessage(msg, (payload) => {
      console.log("Message received in foreground: ", payload);
      
      // Ambil metadata pesan
      const payloadData = payload.data || {};
      const message_id = payload.messageId || payload.fcmMessageId || '';
      const message_name = payloadData['google.c.a.c_l'] || '';
      const message_time = payloadData['google.c.a.ts'] || '';

      // Push ke DataLayer untuk tracking kustom
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        event: 'notification_foreground',
        message_id: message_id,
        message_name: message_name,
        message_time: message_time,
        message_device_time: new Date().toISOString()
      });

      callback(payload);
    });
  } catch (error) {
    console.error("Failed to initialize foreground message listener", error);
    return null;
  }
};
