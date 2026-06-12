import { useEffect } from 'react';
import { AppRouter } from './routes';
import { NotificationPermission } from './components/NotificationPermission';
import { NotificationToast } from './components/NotificationToast';

function App() {
  useEffect(() => {
    // 1. Tangkap klik dari background (Jendela baru dibuka oleh SW)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fcm_click') === 'true') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        event: 'notification_open',
        message_id: urlParams.get('message_id') || '',
        message_name: urlParams.get('message_name') || '',
        message_time: urlParams.get('message_time') || '',
        message_device_time: new Date().toISOString()
      });
      
      // Bersihkan URL parameter fcm_click dll agar tidak ter-track dua kali saat di-refresh
      urlParams.delete('fcm_click');
      urlParams.delete('message_id');
      urlParams.delete('message_name');
      urlParams.delete('message_time');
      const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // 2. Tangkap klik dari background (Jendela lama difokuskan kembali oleh SW)
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'FCM_NOTIFICATION_CLICK') {
        const payload = event.data.payload || {};
        const payloadData = payload.data || {};
        
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 
          event: 'notification_open',
          message_id: payload.messageId || payload.fcmMessageId || '',
          message_name: payloadData['google.c.a.c_l'] || '',
          message_time: payloadData['google.c.a.ts'] || '',
          message_device_time: new Date().toISOString()
        });

        // Tangani navigasi jika ada link
        const link = payload.fcmOptions?.link || payload.notification?.click_action || payloadData.link;
        if (link) {
          try {
            // Tambahkan parameter ke link agar dataLayer tetap jalan di halaman tujuan
            const targetUrl = new URL(link, window.location.origin);
            targetUrl.searchParams.append('fcm_click', 'true');
            targetUrl.searchParams.append('message_id', message_id);
            targetUrl.searchParams.append('message_name', message_name);
            targetUrl.searchParams.append('message_time', message_time);
            
            window.location.assign(targetUrl.href);
          } catch (error) {
            // Jika parsing gagal, fallback
            window.location.assign(link);
          }
        }
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSwMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
    };
  }, []);

  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        <NotificationPermission />
      </div>
      <NotificationToast />
      <AppRouter />
    </>
  );
}

export default App;
