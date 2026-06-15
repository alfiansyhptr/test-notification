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
