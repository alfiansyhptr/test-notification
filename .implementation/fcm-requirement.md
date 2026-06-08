# Kebutuhan dan Implementasi Firebase Cloud Messaging (FCM) - Case 1

Dokumen ini menjelaskan apa saja yang dibutuhkan, letak konfigurasi, dan rincian fitur FCM yang telah diimplementasikan dalam project ini berdasarkan skenario **Case 1 (Direct Push via Firebase Console)**.

---

## 1. Apa saja yang dibutuhkan untuk setup FCM?

Untuk menjalankan dan melakukan testing FCM secara penuh, Anda membutuhkan hal-hal berikut:

1. **Akun dan Project Firebase**
   - Anda harus membuat sebuah project di [Firebase Console](https://console.firebase.google.com/).
2. **Kredensial Aplikasi Web (Web App Configuration)**
   - Di Firebase Console, Anda perlu mendaftarkan aplikasi Web. Firebase akan memberikan konfigurasi SDK berupa `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, dan `appId`.
3. **Web Push Certificate (VAPID Key)**
   - Masih di Firebase Console (bagian *Project Settings > Cloud Messaging*), Anda perlu men-generate **Key pair** untuk *Web configuration*. Key ini (disebut VAPID Key) dibutuhkan browser untuk menghubungkan aplikasi Anda dengan server push message.
4. **Library Firebase SDK**
   - Package manager NPM: `firebase` (Sudah di-install di project ini menggunakan `npm install firebase`).
5. **Support Browser**
   - Browser modern yang mendukung Service Workers dan Web Push API (Chrome, Firefox, Edge, Safari versi terbaru). Localhost diizinkan, tetapi di tahap produksi harus menggunakan HTTPS.

---

## 2. Di mana saja letak setup / config FCM ini?

Konfigurasi FCM disebar pada beberapa file agar strukturnya rapi, modular, dan aman (tidak ada credential hardcoded):

1. **File Environment (`.env`)**
   - Lokasi: *Root directory* (`/.env`)
   - Fungsi: Menyimpan seluruh `keys` rahasia dari Firebase. Semua variabel menggunakan awalan `VITE_` karena project ini dibangun menggunakan Vite.
2. **Firebase Initializer (`src/config/firebase.ts`)**
   - Fungsi: Membaca credential dari `.env`, melakukan inisialisasi aplikasi (`initializeApp`), dan meng-eksport module `messaging` untuk digunakan pada file lain.
3. **Service Worker (`public/firebase-messaging-sw.js`)**
   - Fungsi: Script background murni JavaScript (JS). Service worker ini me-load library firebase dari CDN secara *compat*, lalu menangkap notifikasi masuk ketika website/tab sedang ditutup (Background State). Service worker ini tidak menggunakan `.env` karena letaknya di folder `public`, tetapi mendapatkan konfigurasinya secara aman saat *registration* dari `fcmService.ts`.

---

## 3. Apa saja yang disetup dari sisi Code & Fitur FCM yang diimplementasi?

Pada sisi code (React codebase), implementasi FCM disusun menggunakan pendekatan *Layered Architecture* (Hooks, Services, dan Components). Berikut adalah fitur FCM yang di-implementasikan dalam Case 1 ini:

### Fitur 1: Permission Handling (Permintaan Izin Notifikasi)
- **Code:** `src/hooks/useFCM.ts` & `src/components/NotificationPermission.tsx`
- **Penjelasan:** Aplikasi dapat mengecek status izin (*granted*, *denied*, *default*). Terdapat tombol "Enable Notifications" yang memicu native popup dari browser dengan memanggil `Notification.requestPermission()`.

### Fitur 2: Token Generation (Pembuatan FCM Token)
- **Code:** `src/services/fcmService.ts`
- **Penjelasan:** Jika izin notifikasi sudah diberikan (*granted*), sistem akan memanggil fungsi `getToken()` dari SDK Firebase beserta `VAPID_KEY`. Proses ini juga secara manual mendaftarkan file service worker (`firebase-messaging-sw.js`) ke browser agar token dapat dibuat. Token berhasil digenerate pada klien tanpa menyimpannya ke database Backend (Sesuai kriteria Case 1).

### Fitur 3: Foreground Notifications (Notifikasi Saat Aplikasi Dibuka)
- **Code:** `src/services/notificationService.ts` & `src/components/NotificationToast.tsx`
- **Penjelasan:** Ketika pengguna sedang aktif membuka web app (Foreground), notifikasi tidak akan muncul via sistem bawaan OS. Oleh karena itu, kita memanggil `onMessage()`. Apabila ada pesan masuk, akan ditangkap lalu diteruskan ke Global Context, dan memunculkan custom Toast UI (Notifikasi di dalam browser/aplikasi).

### Fitur 4: Background Notifications (Notifikasi Saat Aplikasi Ditutup / Background)
- **Code:** `public/firebase-messaging-sw.js`
- **Penjelasan:** Menangkap pesan FCM saat web ditutup menggunakan `messaging.onBackgroundMessage()`. Fitur ini akan memunculkan banner notifikasi native bawaan sistem operasi komputer. Ketika notifikasi native di-klik (`notificationclick`), aplikasi akan mencoba melakukan *focus* pada tab React yang sudah terbuka atau membuka tab baru secara otomatis.

### Fitur 5: Global Notification State Management
- **Code:** `src/context/NotificationContext.tsx`
- **Penjelasan:** Merupakan React Context yang menyimpan seluruh status notifikasi:
  - Menyimpan array riwayat notifikasi (`notifications`).
  - Menghitung jumlah pesan yang belum dibaca (`unreadCount`).
  - Menyediakan *methods* (`addNotification`, `markAsRead`, `clearNotifications`) yang dapat digunakan untuk pengembangan Notification Center di masa mendatang.
