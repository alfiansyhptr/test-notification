importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

self.addEventListener('install', (event) => {
  console.log('FCM Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('FCM Service worker activating...');
});

const urlParams = new URLSearchParams(location.search);
const configParam = urlParams.get('config');

if (configParam) {
  try {
    const firebaseConfig = JSON.parse(decodeURIComponent(configParam));
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      const notificationTitle = payload.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body,
        icon: '/iod.png',
        data: payload.data
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (error) {
    console.error('Failed to parse Firebase config in service worker', error);
  }
} else {
  console.warn('Firebase config missing from service worker registration URL.');
}

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
