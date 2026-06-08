# FCM Requirement for React Application — Case 1

## Case 1 Overview

This case covers **direct push notifications sent from Firebase Cloud Messaging Console**.

### Key Rule

* **Do not store FCM tokens in the backend**.
* The React app only needs to request permission, generate the token, and receive notifications.
* Notification sending is handled manually from Firebase Console.

---

## 1. Objectives

Implement Firebase Cloud Messaging (FCM) to enable:

* Browser push notifications
* Foreground notifications
* Background notifications
* Permission handling
* FCM token generation on the client
* Notification click actions

This case is intended for direct testing or manual sending through Firebase Console.

---

## 2. Required Dependencies

Install Firebase SDK:

```bash
npm install firebase
```

or

```bash
yarn add firebase
```

---

## 3. Environment Variables

Create:

```text
.env
```

or

```text
.env.local
```

Example:

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_VAPID_KEY=
```

Requirements:

* Never hardcode Firebase credentials.
* All Firebase configuration values must come from environment variables.

---

## 4. Recommended React Folder Structure

```text
src/
│
├── config/
│   └── firebase.js
│
├── services/
│   ├── fcmService.js
│   └── notificationService.js
│
├── hooks/
│   └── useFCM.js
│
├── context/
│   └── NotificationContext.js
│
├── components/
│   ├── NotificationPermission.jsx
│   └── NotificationToast.jsx
│
└── App.jsx

public/
│
└── firebase-messaging-sw.js
```

---

## 5. Firebase Initialization

### File Location

```text
src/config/firebase.js
```

Responsibilities:

* Initialize Firebase App
* Initialize Firebase Messaging
* Export messaging instance
* Prevent duplicate Firebase initialization

Requirements:

* `initializeApp()` must only run once.
* `getMessaging()` must be initialized from the shared app instance.

---

## 6. Service Worker Setup

### File Location

```text
public/firebase-messaging-sw.js
```

Responsibilities:

* Receive background notifications
* Display notifications when the application is inactive
* Handle notification click actions
* Redirect users to target pages

Requirements:

* Service worker must be automatically registered.
* Must not conflict with existing service workers.
* Must support notification payloads from FCM.

---

## 7. FCM Hook

### File Location

```text
src/hooks/useFCM.js
```

Responsibilities:

#### Request Notification Permission

Handle:

```javascript
Notification.requestPermission()
```

Possible states:

```javascript
granted
denied
default
```

#### Generate FCM Token

Use:

```javascript
getToken()
```

Requirements:

* Generate token after permission is granted.
* Return token to caller.
* Handle errors gracefully.

#### Token Refresh

When token changes:

* Keep app state in sync.
* Replace the previous token locally if needed.

---

## 8. FCM Service Layer

### File Location

```text
src/services/fcmService.js
```

Responsibilities:

#### getFCMToken()

Retrieve current browser token.

#### registerToken()

Not required in this case.

#### deleteToken()

Not required in this case.

---

## 9. Notification Service

### File Location

```text
src/services/notificationService.js
```

Responsibilities:

#### Foreground Notification Handling

Use:

```javascript
onMessage()
```

Requirements:

* Display toast notification.
* Update notification state.
* Update unread counter.
* Trigger custom actions if needed.

---

## 10. Notification Context

### File Location

```text
src/context/NotificationContext.js
```

Global state structure:

```javascript
{
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {}
}
```

Requirements:

* Accessible across the entire application.
* Support future notification center implementation.

---

## 11. UI Components

### NotificationPermission.jsx

Responsibilities:

* Display current permission status
* Allow users to enable notifications
* Request browser permission

### NotificationToast.jsx

Responsibilities:

* Display foreground notifications
* Support notification title and body
* Support click action

---

## 12. Application Integration

### During App Start / Login

1. Request notification permission.
2. Generate FCM token.
3. Do **not** send token to backend.
4. Start foreground notification listener.

### During Logout

1. Clear local notification state if needed.
2. Stop notification listeners.

---

## 13. What Is Not Required in Case 1

* Token persistence in backend
* User-token mapping in database
* Register token API
* Delete token API
* CMS send notification API
* Audience segmentation
* Notification logs in backend

---

## 14. Required FCM Features

### Mandatory Features

* Notification permission request
* FCM token generation
* Foreground notifications
* Background notifications
* Notification click actions

### Optional Frontend Enhancements

* Local notification state
* Unread badge count
* Notification center UI

---

## 15. Acceptance Criteria

Implementation is considered complete when:

* Users can grant notification permissions.
* FCM token is generated in the browser.
* Notifications appear when sent from Firebase Console.
* Notifications work in foreground and background.
* No backend token storage is used.
* No token registration API is required.

---

## Agent Implementation Prompt

> Implement Firebase Cloud Messaging (FCM) for this React application in **Case 1** mode. Configure Firebase initialization, service worker registration, notification permission handling, FCM token generation, foreground and background notification handling, and notification click actions. Do not store FCM tokens in the backend. This case must support notifications sent directly from Firebase Cloud Messaging Console. Store all Firebase credentials in environment variables and follow the project architecture described in this document. Ensure the implementation is reusable, scalable, and production-ready.
