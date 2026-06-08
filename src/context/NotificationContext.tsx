import React, { createContext, useContext, useState, type ReactNode } from "react";

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  read: boolean;
  data?: any;
}

interface NotificationContextProps {
  notifications: NotificationPayload[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationPayload, "id" | "read">) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (notif: Omit<NotificationPayload, "id" | "read">) => {
    const newNotification: NotificationPayload = {
      ...notif,
      id: Date.now().toString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
