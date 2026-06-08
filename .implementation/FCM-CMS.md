# FCM Requirement for React Application — Case 2

## Case 2 Overview

This case covers **push notifications sent from a CMS/admin backend**, with **FCM tokens stored in the backend**.

### Key Rule

* FCM tokens **must be registered and stored in the backend**.
* The backend/CMS is responsible for sending notifications.
* The React app only handles permission, token generation, and receiving notifications.

---

## 1. Objectives

Implement Firebase Cloud Messaging (FCM) to enable:

* Browser push notifications
* Foreground notifications
* Background notifications
* Token registration and storage in backend
* User-specific notification delivery
* Token refresh and cleanup
* Future support for notification center and notification history

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

* Update backend.
* Replace previous token.
* Keep backend database in sync.

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

Send token to backend.

Endpoint:

```http
POST /api/fcm/register
```

Request:

```json
{
  "userId": "123",
  "token": "FCM_TOKEN",
  "platform": "web"
}
```

#### deleteToken()

Remove token association during logout.

Endpoint:

```http
DELETE /api/fcm/token
```

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
* Optionally show whether backend sync is active

### NotificationToast.jsx

Responsibilities:

* Display foreground notifications
* Support notification title and body
* Support click action

---

## 12. Application Integration

### During Login

When a user logs in:

1. Request notification permission.
2. Generate FCM token.
3. Send token to backend.
4. Start foreground notification listener.

### During Logout

When a user logs out:

1. Remove token association if required.
2. Stop notification listeners.
3. Clean up local notification state if needed.

---

## 13. Backend APIs Required

### Register Token

```http
POST /api/fcm/register
```

### Update Token

```http
PUT /api/fcm/token
```

### Delete Token

```http
DELETE /api/fcm/token
```

### Send Notification

```http
POST /api/fcm/send
```

Request Example:

```json
{
  "userId": "123",
  "title": "New Notification",
  "body": "Notification message",
  "data": {}
}
```

---

## 14. Database Schema

### user_push_tokens

Suggested fields:

```sql
id
user_id
fcm_token
platform
is_active
created_at
updated_at
last_seen_at
```

Indexes:

```sql
user_id
fcm_token
```

Requirements:

* Token must be unique.
* Prevent duplicate registrations.
* Keep active token records up to date.

---

## 15. Required FCM Features

### Mandatory Features

* Notification permission request
* FCM token generation
* Token registration to backend
* Foreground notifications
* Background notifications
* Notification click actions
* Token refresh handling
* Logout cleanup

### Optional Enhancements

* Notification center
* Notification history
* Scheduled notifications
* Topic notifications
* Audience segmentation

---

## 16. Acceptance Criteria

Implementation is considered complete when:

* Users can grant notification permissions.
* FCM token is successfully generated.
* Token is stored in backend database.
* Notifications appear while the app is open.
* Notifications appear while the app is in the background.
* Notification click actions work correctly.
* Token refresh is handled automatically.
* Invalid tokens can be removed or deactivated.
* No Firebase credentials are hardcoded.

---

## Agent Implementation Prompt

> Implement Firebase Cloud Messaging (FCM) for this React application in **Case 2** mode. Configure Firebase initialization, service worker registration, notification permission handling, FCM token generation, token registration APIs, backend token storage, foreground and background notification handling, notification click actions, token refresh handling, and logout cleanup. Store all Firebase credentials in environment variables and follow the project architecture described in this document. Ensure the implementation is reusable, scalable, and production-ready.
