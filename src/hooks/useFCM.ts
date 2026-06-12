import { useState, useEffect, useCallback } from "react";
import { getFCMToken } from "../services/fcmService";

export const useFCM = () => {
  const isSupported = typeof window !== "undefined" && "Notification" in window;
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : "default"
  );
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError("Notification API is not supported in this browser.");
      return;
    }

    try {
      const p = await Notification.requestPermission();
      setPermission(p);

      if (p === "granted") {
        const generatedToken = await getFCMToken();
        if (generatedToken) {
          setToken(generatedToken);
        }
      } else {
        setError("Notification permission denied");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to request permission");
    }
  }, [isSupported]);

  useEffect(() => {
    // If permission is already granted, generate token automatically on mount
    if (isSupported && Notification.permission === "granted" && !token) {
      requestPermission();
    }
  }, [requestPermission, token, isSupported]);

  return { token, permission, requestPermission, error, isSupported };
};
