import { useState, useEffect, useCallback } from "react";
import { getFCMToken } from "../services/fcmService";

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // If permission is already granted, generate token automatically on mount
    if (Notification.permission === "granted" && !token) {
      requestPermission();
    }
  }, [requestPermission, token]);

  return { token, permission, requestPermission, error };
};
