import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { onForegroundMessage } from '../services/notificationService';

export const NotificationToast: React.FC = () => {
  const { addNotification } = useNotification();
  const [toastNotif, setToastNotif] = useState<any | null>(null);

  useEffect(() => {
    const setupListener = async () => {
      const unsubscribe = await onForegroundMessage((payload) => {
        const title = payload.notification?.title || 'New Notification';
        const body = payload.notification?.body || '';
        
        addNotification({ title, body, data: payload.data });
        
        // Show toast for 5 seconds
        setToastNotif({ title, body });
        setTimeout(() => setToastNotif(null), 5000);
      });
      return unsubscribe;
    };
    
    let unsub: any;
    setupListener().then(res => {
      unsub = res;
    });
    
    return () => {
      if (typeof unsub === 'function') {
        unsub();
      }
    };
  }, [addNotification]);

  if (!toastNotif) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
      <div className="bg-white border-l-4 border-blue-500 shadow-xl rounded-md p-4 min-w-[300px] max-w-sm flex items-start space-x-3 cursor-pointer" onClick={() => setToastNotif(null)}>
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
