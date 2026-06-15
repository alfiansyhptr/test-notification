# Panduan Implementasi Firebase Cloud Messaging (FCM)

Dokumen ini menjelaskan arsitektur dan langkah demi langkah implementasi Firebase Cloud Messaging (FCM) pada proyek React ini. Implementasi ini dirancang khusus untuk mendukung **kustomisasi ikon**, **pengalihan link (redirect)**, dan **pelacakan Google Tag Manager (GTM)** secara murni (Vanilla) untuk mencegah masalah *double notification* bawaan dari SDK Firebase.

---

## Daftar Isi
1. [Arsitektur Umum](#1-arsitektur-umum)
2. [Langkah Implementasi & Contoh Skrip](#2-langkah-implementasi--contoh-skrip)
   - [Tahap 1: Service Worker (Background)](#tahap-1-vanilla-service-worker-background-publicfirebase-messaging-swjs)
   - [Tahap 2: Service Penanganan Pesan Foreground](#tahap-2-service-penanganan-pesan-foreground-srcservicesnotificationservicets)
   - [Tahap 3: UI Toast Notification (Foreground)](#tahap-3-ui-toast-notification-foreground-srccomponentsnotificationtoasttsx)
   - [Tahap 4: Penangkapan Parameter & DataLayer (App.tsx)](#tahap-4-penangkapan-parameter--datalayer-srcapptsx)
3. [Format Custom Data (Firebase Console)](#3-format-custom-data-firebase-console)

---

## 1. Arsitektur Umum

Sistem notifikasi pada aplikasi ini dibagi menjadi dua skenario utama berdasarkan status aplikasi (*Foreground* vs *Background*):

1. **Aplikasi Tertutup / Background**:
   - Ditangani sepenuhnya oleh `firebase-messaging-sw.js` (Vanilla Web Push).
   - Memunculkan *System Notification* bawaan OS (Windows/Mac/Android).
   - Ketika diklik, Service Worker akan memaksa browser membuka/mengalihkan tab ke URL tujuan dengan membawa parameter rahasia `?fcm_click=true`.
   - Menghasilkan event dataLayer `notification_open`.

2. **Aplikasi Terbuka / Foreground**:
   - Ditangani oleh Service Worker yang mendeteksi bahwa tab sedang aktif.
   - Service Worker **tidak** memunculkan notifikasi OS, melainkan mengirim "Sinyal/Pesan" ke React.
   - React memunculkan komponen *UI Toast Notification* di pojok layar.
   - Menghasilkan event dataLayer `notification_foreground` seketika.
   - Jika Toast diklik, terjadi pengalihan halaman dengan parameter `?fcm_click=true` yang akan berujung pada event `notification_open`.

---

## 2. Langkah Implementasi & Contoh Skrip

### Tahap 1: Vanilla Service Worker (Background) (`public/firebase-messaging-sw.js`)
File ini adalah inti dari operasi *background*.
*   **Mengapa Vanilla?** Kita **tidak** mengimpor `firebase-messaging-compat.js` di file ini untuk mencegah SDK Firebase memunculkan notifikasi otomatis secara paksa yang menyebabkan masalah *Double Notification*.
*   `self.addEventListener('push')`: Menangkap push masuk. Jika tab sedang aktif, kirim `postMessage` ke React. Jika tidak, munculkan notifikasi sistem dengan properti `requireInteraction: true` (agar tidak hilang otomatis).
*   `self.addEventListener('notificationclick')`: Menangani klik pada notifikasi OS, menyisipkan parameter ke URL (`fcm_click=true`), dan menggunakan `client.navigate()` untuk merutekan tab yang terbuka.

**Kode Penuh (`public/firebase-messaging-sw.js`):**
```javascript
// Menggunakan Vanilla Service Worker untuk mencegah Firebase SDK memunculkan double notification

self.addEventListener('install', (event) => {
  console.log('FCM Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('FCM Service worker activating...');
});

// Tangani push secara manual agar kita bisa mengontrol icon dan mencegah duplikasi
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push Received.');
  if (!event.data) return;

  try {
    const payload = event.data.json();
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Cek apakah ada tab aplikasi yang sedang aktif (focused)
        const focusedClient = clientList.find(c => c.focused);
        
        if (focusedClient) {
          // Jika aplikasi sedang dibuka (foreground), kirim pesan ke UI
          // agar UI memunculkan Toast Notification dan dataLayer
          focusedClient.postMessage({
            type: 'FCM_FOREGROUND_MESSAGE',
            payload: payload
          });
          
          // Mencegah system notification muncul agar tidak double dengan UI Toast
          return Promise.resolve();
        }
        
        // Jika aplikasi di background, munculkan System Notification kustom kita
        const notification = payload.notification || {};
        const title = notification.title || 'New Notification';
        const options = {
          body: notification.body || '',
          icon: notification.icon || '/iod.png',
          image: notification.image, // Menarik URL gambar banner dari Firebase
          requireInteraction: true, // Membuat notifikasi tidak hilang otomatis sampai diklik/diclose
          data: payload // Simpan full payload untuk event click
        };

        return self.registration.showNotification(title, options);
      })
    );
  } catch (err) {
    console.error('Error parsing push payload', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event);
  event.notification.close();

  // Karena ini vanilla, data langsung tersedia murni di event.notification.data
  const payload = event.notification.data || {};
  const payloadData = payload.data || {};
  const message_id = payload.messageId || payload.fcmMessageId || payloadData.message_id || '';
  const message_name = payloadData['google.c.a.c_l'] || '';
  const message_time = payloadData['google.c.a.ts'] || '';

  // 2. Tentukan URL tujuan dari payload
  let targetUrl = '/';
  if (payload.fcmOptions && payload.fcmOptions.link) {
    targetUrl = payload.fcmOptions.link;
  } else if (payload.notification && payload.notification.click_action) {
    targetUrl = payload.notification.click_action;
  } else if (payloadData.link) {
    targetUrl = payloadData.link;
  }

  // 3. Bangun URL dengan parameter lengkap
  const urlToOpen = new URL(targetUrl, self.location.origin);
  urlToOpen.searchParams.append('fcm_click', 'true');
  urlToOpen.searchParams.append('message_id', message_id);
  urlToOpen.searchParams.append('message_name', message_name);
  urlToOpen.searchParams.append('message_time', message_time);

  // 4. Buka atau alihkan halaman
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        client.focus();
        
        // Gunakan API native Service Worker untuk mengalihkan URL tab yang sedang terbuka
        if ('navigate' in client) {
          return client.navigate(urlToOpen.href);
        } else {
          // Fallback darurat
          client.postMessage({ type: 'FCM_NAVIGATE', url: urlToOpen.href });
          return;
        }
      }
      
      // Buka window baru ke target URL jika belum ada tab terbuka
      return clients.openWindow(urlToOpen.href);
    })
  );
});
```

### Tahap 2: Service Penanganan Pesan Foreground (`src/services/notificationService.ts`)
File ini bertindak sebagai jembatan antara Service Worker dan React UI saat aplikasi sedang dibuka.
*   `onForegroundMessage()`: Fungsi ini *listen* (mendengarkan) event pesan `FCM_FOREGROUND_MESSAGE` dari Service Worker.
*   Menembakkan kode pelacakan `notification_foreground` ke GTM via `window.dataLayer`.

**Kode Penuh (`src/services/notificationService.ts`):**
```typescript
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
```

### Tahap 3: UI Toast Notification (Foreground) (`src/components/NotificationToast.tsx`)
Komponen visual untuk menggantikan notifikasi sistem ketika pengguna sedang berinteraksi dengan website.
*   **Karakteristik**: Tidak memiliki *timeout* otomatis, akan terus muncul sampai diklik atau ditutup paksa.
*   **Fungsi Redirect**: Saat *Toast* diklik, ia memiliki logika kembar seperti Service Worker. Ia mengambil atribut `link`, lalu mengalihkan halaman (`window.location.assign`) dengan menyuntikkan `?fcm_click=true`.

**Kode Penuh (`src/components/NotificationToast.tsx`):**
```tsx
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
        className="bg-white border-l-4 border-blue-500 shadow-xl rounded-md p-4 min-w-[300px] max-w-sm flex flex-col items-start cursor-pointer" 
        onClick={handleToastClick}
      >
        <div className="flex w-full items-start space-x-3">
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
        {toastNotif.payload?.notification?.image && (
          <div className="mt-3 w-full">
            <img 
              src={toastNotif.payload.notification.image} 
              alt="Notification Banner" 
              className="w-full h-auto rounded-md object-cover max-h-40" 
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

### Tahap 4: Penangkapan Parameter & DataLayer (`src/App.tsx`)
Setiap kali aplikasi React dimuat (baik lewat klik notifikasi *background* maupun klik *Toast* di *foreground*), `App.tsx` akan otomatis membedah URL.
*   Jika mendeteksi `fcm_click=true`, ia menembakkan `window.dataLayer.push({ event: 'notification_open' })`.
*   Ia juga menggunakan `window.history.replaceState` untuk menyembunyikan parameter parameter jelek dari URL dan membuatnya rapi kembali.

**Potongan Kode Utama (`src/App.tsx`):**
```tsx
import { useEffect } from 'react';
// ... import lainnya

function App() {
  useEffect(() => {
    // 1. Tangkap klik dari URL (Pengalihan dari SW atau Toast)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fcm_click') === 'true') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({ 
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
  }, []);

  return (
    // ... layout aplikasi
  );
}

export default App;
```

---

## 3. Format Custom Data (Firebase Console)

Agar pelacakan *dataLayer* dan *redirect* berfungsi maksimal, saat membuat Campaign di Firebase Console, pastikan Anda menggunakan blok **Custom data** di bagian "Additional options" dengan kunci (*Keys*) berikut:

| Key | Value (Contoh) | Keterangan |
| :--- | :--- | :--- |
| `link` | `http://localhost:5173/cars` | Tautan tujuan ke mana user akan dialihkan saat mengklik notifikasi (mendukung parameter UTM). |
| `message_id` | `promo-ramadhan-1` | ID Unik untuk melacak notifikasi spesifik di Analytics. |
| `google.c.a.c_l`| `Promo Ramadhan` | (Opsional) Terisi otomatis oleh label campaign Firebase, atau bisa diganti secara manual jika perlu. |
| `google.c.a.ts` | `171818222` | (Opsional) Terisi otomatis oleh sistem waktu Firebase. |

*(Dengan memasukkan `link` di dalam Custom Data, baik Service Worker maupun komponen Toast dapat membaca rute tujuan tersebut sebelum menginjeksinya dengan parameter pelacak).*
