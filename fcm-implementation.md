# Firebase Cloud Messaging (FCM) Implementation Guide

This document explains the architecture and step-by-step implementation of Firebase Cloud Messaging (FCM) in this React project. This implementation is specifically designed to support **icon customization**, **link redirection**, and **Google Tag Manager (GTM) tracking** natively (Vanilla) to prevent the *double notification* issue inherent to the Firebase SDK.

---

## Table of Contents
1. [General Architecture](#1-general-architecture)
2. [Implementation Steps & Code Examples](#2-implementation-steps--code-examples)
   - [Step 1: Vanilla Service Worker (Background)](#step-1-vanilla-service-worker-background-publicfirebase-messaging-swjs)
   - [Step 2: Foreground Message Handling Service](#step-2-foreground-message-handling-service-srcservicesnotificationservicets)
   - [Step 3: UI Toast Notification (Foreground)](#step-3-ui-toast-notification-foreground-srccomponentsnotificationtoasttsx)
   - [Step 4: Parameter Interception & DataLayer (App.tsx)](#step-4-parameter-interception--datalayer-srcapptsx)
3. [Custom Data Format (Firebase Console)](#3-custom-data-format-firebase-console)

---

## 1. General Architecture

The notification system in this application is divided into two main scenarios based on the application state (*Foreground* vs *Background*):

1. **App Closed / Background**:
   - Handled entirely by `firebase-messaging-sw.js` (Vanilla Web Push).
   - Triggers the native *System Notification* of the OS (Windows/Mac/Android).
   - When clicked, the Service Worker forces the browser to open/redirect a tab to the destination URL while carrying the secret parameter `?fcm_click=true`.
   - Generates the `notification_open` dataLayer event.

2. **App Open / Foreground**:
   - Handled by the Service Worker detecting that the tab is currently active.
   - The Service Worker **does not** trigger an OS notification; instead, it sends a "Signal/Message" to React.
   - React displays the *UI Toast Notification* component in the corner of the screen.
   - Immediately generates the `notification_foreground` dataLayer event.
   - If the Toast is clicked, a page redirect occurs with the `?fcm_click=true` parameter, which ultimately leads to the `notification_open` event.

---

## 2. Implementation Steps & Code Examples

### Step 1: Vanilla Service Worker (Background) (`public/firebase-messaging-sw.js`)
This file is the core of the *background* operation.
*   **Why Vanilla?** We **do not** import `firebase-messaging-compat.js` in this file to prevent the Firebase SDK from forcefully showing automatic notifications, which causes the *Double Notification* issue.
*   `self.addEventListener('push')`: Catches incoming pushes. If the tab is active, send a `postMessage` to React. If not, show the system notification with the `requireInteraction: true` property (so it doesn't disappear automatically).
*   `self.addEventListener('notificationclick')`: Handles clicks on the OS notification, injects parameters into the URL (`fcm_click=true`), and uses `client.navigate()` to route the open tab.

**Full Code (`public/firebase-messaging-sw.js`):**
```javascript
// Use a Vanilla Service Worker to prevent the Firebase SDK from showing double notifications

self.addEventListener('install', (event) => {
  console.log('FCM Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('FCM Service worker activating...');
});

// Handle push manually so we can control the icon and prevent duplication
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push Received.');
  if (!event.data) return;

  try {
    const payload = event.data.json();
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there is an active (focused) application tab
        const focusedClient = clientList.find(c => c.focused);
        
        if (focusedClient) {
          // If the application is open (foreground), send a message to the UI
          // so the UI can display the Toast Notification and dataLayer
          focusedClient.postMessage({
            type: 'FCM_FOREGROUND_MESSAGE',
            payload: payload
          });
          
          // Prevent the system notification from showing up to avoid doubling with the UI Toast
          return Promise.resolve();
        }
        
        // If the application is in the background, show our custom System Notification
        const notification = payload.notification || {};
        const title = notification.title || 'New Notification';
        const options = {
          body: notification.body || '',
          icon: notification.icon || '/iod.png',
          image: notification.image, // Fetch the banner image URL from Firebase
          requireInteraction: true, // Make the notification persist until clicked/closed
          data: payload // Save the full payload for the click event
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

  // Since this is vanilla, the data is available natively in event.notification.data
  const payload = event.notification.data || {};
  const payloadData = payload.data || {};
  const message_id = payload.messageId || payload.fcmMessageId || payloadData.message_id || '';
  const message_name = payloadData['google.c.a.c_l'] || '';
  const message_time = payloadData['google.c.a.ts'] || '';

  // 2. Determine the destination URL from the payload
  let targetUrl = '/';
  if (payload.fcmOptions && payload.fcmOptions.link) {
    targetUrl = payload.fcmOptions.link;
  } else if (payload.notification && payload.notification.click_action) {
    targetUrl = payload.notification.click_action;
  } else if (payloadData.link) {
    targetUrl = payloadData.link;
  }

  // 3. Construct the URL with full parameters
  const urlToOpen = new URL(targetUrl, self.location.origin);
  urlToOpen.searchParams.append('fcm_click', 'true');
  urlToOpen.searchParams.append('message_id', message_id);
  urlToOpen.searchParams.append('message_name', message_name);
  urlToOpen.searchParams.append('message_time', message_time);

  // 4. Open or redirect the page
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
        
        // Use the native Service Worker API to redirect the URL of the currently open tab
        if ('navigate' in client) {
          return client.navigate(urlToOpen.href);
        } else {
          // Emergency fallback
          client.postMessage({ type: 'FCM_NAVIGATE', url: urlToOpen.href });
          return;
        }
      }
      
      // Open a new window to the target URL if no tab is currently open
      return clients.openWindow(urlToOpen.href);
    })
  );
});
```

### Step 2: Foreground Message Handling Service (`src/services/notificationService.ts`)
This file acts as a bridge between the Service Worker and the React UI when the application is open.
*   `onForegroundMessage()`: This function listens for the `FCM_FOREGROUND_MESSAGE` event sent by the Service Worker.
*   Fires the `notification_foreground` tracking code to GTM via `window.dataLayer`.

**Full Code (`src/services/notificationService.ts`):**
```typescript
export const onForegroundMessage = (callback: (payload: any) => void) => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'FCM_FOREGROUND_MESSAGE') {
      const payload = event.data.payload;
      console.log("Message received in foreground: ", payload);
      
      // Extract message metadata
      const payloadData = payload.data || {};
      const message_id = payload.messageId || payload.fcmMessageId || payloadData.message_id || '';
      const message_name = payloadData['google.c.a.c_l'] || '';
      const message_time = payloadData['google.c.a.ts'] || '';

      // Push to DataLayer for custom tracking
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

### Step 3: UI Toast Notification (Foreground) (`src/components/NotificationToast.tsx`)
A visual component to replace the system notification when the user is interacting with the website.
*   **Characteristics**: Does not have an automatic timeout; it will remain visible until clicked or manually closed.
*   **Redirect Function**: When the *Toast* is clicked, it shares the same logic as the Service Worker. It retrieves the `link` attribute, then redirects the page (`window.location.assign`) by injecting `?fcm_click=true`.

**Full Code (`src/components/NotificationToast.tsx`):**
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
      
      // Display the toast and save the payload (no setTimeout so it doesn't auto-dismiss)
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

    // Determine the destination URL from the payload
    let targetUrl = '/';
    if (payload.fcmOptions && payload.fcmOptions.link) {
      targetUrl = payload.fcmOptions.link;
    } else if (payload.notification && payload.notification.click_action) {
      targetUrl = payload.notification.click_action;
    } else if (payloadData.link) {
      targetUrl = payloadData.link;
    }

    // Construct the URL with full parameters so the dataLayer is triggered on the destination page
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

### Step 4: Parameter Interception & DataLayer (`src/App.tsx`)
Every time the React application is loaded (either via a *background* notification click or a *Foreground* Toast click), `App.tsx` will automatically parse the URL.
*   If it detects `fcm_click=true`, it fires `window.dataLayer.push({ event: 'notification_open' })`.
*   It also uses `window.history.replaceState` to hide the tracking parameters from the URL and make it look clean again.

**Main Code Snippet (`src/App.tsx`):**
```tsx
import { useEffect } from 'react';
// ... other imports

function App() {
  useEffect(() => {
    // 1. Catch clicks from the URL (Redirections from SW or Toast)
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
      
      // Clean up the URL parameters (fcm_click, etc.) to prevent double tracking upon refresh
      urlParams.delete('fcm_click');
      urlParams.delete('message_id');
      urlParams.delete('message_name');
      urlParams.delete('message_time');
      const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  return (
    // ... application layout
  );
}

export default App;
```

---

## 3. Custom Data Format (Firebase Console)

To ensure *dataLayer* tracking and *redirects* function optimally, when creating a Campaign in the Firebase Console, make sure you use the **Custom data** block in the "Additional options" section with the following *Keys*:

| Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `link` | `http://localhost:5173/cars` | The destination link where the user will be redirected upon clicking the notification (supports UTM parameters). |
| `message_id` | `promo-ramadhan-1` | A unique ID to track specific notifications in Analytics. |
| `google.c.a.c_l`| `Promo Ramadhan` | (Optional) Automatically filled by Firebase's campaign label, or can be manually overridden if necessary. |
| `google.c.a.ts` | `171818222` | (Optional) Automatically filled by the Firebase time system. |

*(By including `link` inside the Custom Data, both the Service Worker and the Toast component can read the destination route before injecting it with tracking parameters).*
