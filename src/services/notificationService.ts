
export const onForegroundMessage = (callback: (payload: any) => void) => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'FCM_FOREGROUND_MESSAGE') {
      const payload = event.data.payload;
      console.log("Message received in foreground: ", payload);
      
      // Ambil metadata pesan
      const payloadData = payload.data || {};
      const message_id = payload.messageId || payload.fcmMessageId || payloadData.message_id || '';
      const message_name = payloadData['google.c.a.c_l'] || '';
      const message_time = payloadData['google.c.a.ts'] || '';

      // Push ke DataLayer untuk tracking kustom
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({ 
        event: 'notification_foreground',
        message_id: message_id,
        message_name: message_name,
        message_time: message_time,
        message_device_time: new Date().toISOString()
      });

      callback(payload);
    }
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handleMessage);
  }

  // Return a cleanup function
  return () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  };
};
