saya coba persingkat:



1. SDK firebase di /config/firebase.ts:

- yang di install dalam project:

import { initializeApp, getApps } from "firebase/app";

import { getMessaging, isSupported } from "firebase/messaging";

import { getAnalytics } from "firebase/analytics";



export const firebaseConfig = {

  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,

  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId: import.meta.env.VITE_FIREBASE_APP_ID,

  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, //G-VZ02RH681B

};



// Initialize Firebase

// Ensure we only initialize once

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const analytics = getAnalytics(app);



// Initialize Messaging

// Check if supported (e.g. not supported in incognito or Safari < 16.4)

export const messaging = async () => {

  const supported = await isSupported();

  if (supported) {

    return getMessaging(app);

  }

  return null;

};



export default app;



- SDK app project:



// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries



// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyCqKwIgpR3KgAaXyhCkfwZg-A5WmTd1-zA",

  authDomain: "opaku-shopping.firebaseapp.com",

  projectId: "opaku-shopping",

  storageBucket: "opaku-shopping.firebasestorage.app",

  messagingSenderId: "1065010279957",

  appId: "1:1065010279957:web:58283fa41b19c85e11c01c",

  measurementId: "G-0PD3MY8L97"

};



// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);


2. firebase-messaging-sw.js:

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



