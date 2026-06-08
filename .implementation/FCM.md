# FCM Requirement for React Application

## Project Stack
- Frontend: React.js
- Build Tool: React Scripts (CRA) atau Vite React
- Backend: API existing project (Node.js/NestJS/Express atau service backend lain)
- Notification Provider: Firebase Cloud Messaging (FCM)

---

# 1. Objective

Implement Firebase Cloud Messaging (FCM) pada aplikasi React untuk:

- Browser push notification.
- Foreground notification.
- Background notification.
- Menyimpan token FCM ke backend.
- Mengirim notification berdasarkan user.
- Mendukung future enhancement seperti notification center dan topic notification.

---

# 2. Dependencies yang Dibutuhkan

## Frontend

Install Firebase SDK:

```bash
npm install firebase
```

atau

```bash
yarn add firebase
```

---

# 3. Environment Variables

Buat file:

```text
.env
```

atau

```text
.env.local
```

Contoh:

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_VAPID_KEY=
```

Tidak boleh hardcode credential Firebase di source code.

---

# 4. Struktur Folder React

```text
src/
│
├── config/
│   └── firebase.js
│
├── services/
│   ├── notificationService.js
│   └── fcmService.js
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

# 5. Firebase Setup Location

## File

```text
src/config/firebase.js
```

Tanggung jawab:

- Initialize Firebase App
- Initialize Messaging
- Export messaging instance

Agent harus memastikan Firebase hanya diinisialisasi satu kali.

---

# 6. Service Worker Setup

## File

```text
public/firebase-messaging-sw.js
```

Function:

- Handle background notification
- Show notification ketika browser tidak aktif
- Handle click action
- Open target URL

Agent harus memastikan service worker:

- otomatis diregistrasikan
- tidak conflict dengan service worker lain

---

# 7. React Hook FCM

## File

```text
src/hooks/useFCM.js
```

Function:

### Request Permission

```javascript
Notification.requestPermission()
```

Handle:

- granted
- denied
- default

### Generate Token

Menggunakan:

```javascript
getToken()
```

dari Firebase Messaging.

### Refresh Token

Jika token berubah:

- update backend
- update database

---

# 8. FCM Service

## File

```text
src/services/fcmService.js
```

Responsibilities:

### getFCMToken()

Mengambil token dari browser.

### saveToken()

Mengirim token ke backend.

Endpoint:

```http
POST /api/fcm/register
```

Payload:

```json
{
  "userId": "123",
  "token": "FCM_TOKEN",
  "platform": "web"
}
```

### deleteToken()

Saat logout:

```http
DELETE /api/fcm/token
```

---

# 9. Notification Service

## File

```text
src/services/notificationService.js
```

Responsibilities:

### Foreground Notification

Menggunakan:

```javascript
onMessage()
```

Saat notification diterima:

- tampilkan toast
- update state notification
- update badge count

---

# 10. Notification Context

## File

```text
src/context/NotificationContext.js
```

State yang harus tersedia:

```javascript
{
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {}
}
```

Digunakan oleh seluruh aplikasi.

---

# 11. UI Components

## NotificationPermission.jsx

Function:

- cek permission status
- tampilkan tombol enable notification
- request permission

## NotificationToast.jsx

Function:

- menampilkan notifikasi ketika app sedang terbuka

---

# 12. Integrasi pada App.jsx

Agent harus:

### Saat User Login

1. Request permission.
2. Ambil token.
3. Simpan token ke backend.
4. Start listener foreground notification.

### Saat Logout

1. Hapus token jika diperlukan.
2. Stop listener.

---

# 13. Backend API yang Harus Tersedia

## Register Token

```http
POST /api/fcm/register
```

## Update Token

```http
PUT /api/fcm/token
```

## Delete Token

```http
DELETE /api/fcm/token
```

## Send Notification

```http
POST /api/fcm/send
```

Payload:

```json
{
  "userId": "123",
  "title": "New Notification",
  "body": "Notification Message",
  "data": {}
}
```

---

# 14. Database Schema

## user_push_tokens

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

Index:

```sql
user_id
fcm_token
```

Token harus unik.

---

# 15. FCM Features yang Wajib Diimplementasi

## Mandatory

### Permission Request

Browser meminta izin notification.

### Token Generation

Menghasilkan FCM token.

### Token Registration

Menyimpan token ke backend.

### Foreground Notification

Notification muncul saat React app aktif.

### Background Notification

Notification muncul saat tab/browser tidak aktif.

### Notification Click Action

Klik notification membuka halaman tertentu.

### Token Refresh

Update token otomatis.

### Logout Cleanup

Token dapat dinonaktifkan.

---

# 16. Future Features

### Notification Center

Daftar seluruh notification.

### Notification History

Riwayat notification user.

### Scheduled Notification

Notifikasi terjadwal.

### Topic Notification

Marketing, Product Updates, Reports.

### Segment Notification

Kirim berdasarkan audience tertentu.

---

# 17. Acceptance Criteria

Implementasi dianggap selesai jika:

- Browser meminta permission.
- FCM token berhasil dibuat.
- Token tersimpan di backend.
- Notification tampil saat app aktif.
- Notification tampil saat app background.
- Klik notification membuka halaman target.
- Token dapat diupdate.
- Token invalid dapat dibersihkan.
- Logout tidak meninggalkan token aktif yang tidak diperlukan.

---

# Prompt untuk Agent

Implement Firebase Cloud Messaging (FCM) pada aplikasi React. Tambahkan firebase configuration, service worker, React hooks, notification context, foreground dan background notification handling, token registration ke backend, token refresh handling, notification click action, dan cleanup token saat logout. Simpan seluruh credential di environment variables dan ikuti struktur folder yang dijelaskan pada dokumen ini.
