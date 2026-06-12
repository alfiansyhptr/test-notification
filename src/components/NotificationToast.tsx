import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { onForegroundMessage } from '../services/notificationService';

export const NotificationToast: React.FC = () => {
  const { addNotification } = useNotification();
  const [toastNotif, setToastNotif] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      
      addNotification({ title, body, data: payload.data });
      
      // Tampilkan toast dan simpan payload (tanpa setTimeout agar tidak hilang otomatis)
      setToastNotif({ title, body, payload });
    });
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [addNotification]);

  if (!toastNotif) return null;

  const handleToastClick = () => {
    if (!toastNotif || !toastNotif.payload) return;
    
    const payload = toastNotif.payload;
    const payloadData = payload.data || {};
    const message_id = payload.messageId || payload.fcmMessageId || payloadData.message_id || '';
    const message_name = payloadData['google.c.a.c_l'] || '';
    const message_time = payloadData['google.c.a.ts'] || '';

    // Tentukan URL tujuan dari payload
    let targetUrl = '/';
    if (payload.fcmOptions && payload.fcmOptions.link) {
      targetUrl = payload.fcmOptions.link;
    } else if (payload.notification && payload.notification.click_action) {
      targetUrl = payload.notification.click_action;
    } else if (payloadData.link) {
      targetUrl = payloadData.link;
    }

    // Bangun URL dengan parameter lengkap agar dataLayer tertrigger di halaman tujuan
    const urlToOpen = new URL(targetUrl, window.location.origin);
    urlToOpen.searchParams.append('fcm_click', 'true');
    urlToOpen.searchParams.append('message_id', message_id);
    urlToOpen.searchParams.append('message_name', message_name);
    urlToOpen.searchParams.append('message_time', message_time);

    // Redirect
    window.location.assign(urlToOpen.href);
    setToastNotif(null);
  };

  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
      <div 
        className="bg-white border-l-4 border-blue-500 shadow-xl rounded-md p-4 min-w-[300px] max-w-sm flex items-start space-x-3 cursor-pointer" 
        onClick={handleToastClick}
      >
        <div className="flex-1">
          <h4 className="font-bold text-gray-800">{toastNotif.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{toastNotif.body}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setToastNotif(null); }}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};
