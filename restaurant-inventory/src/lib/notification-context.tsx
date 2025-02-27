"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = uuidv4();
      const newNotification = {
        ...notification,
        id,
        duration: notification.duration || 5000,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove notification after duration
      if (newNotification.duration !== Infinity) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}

// Helper functions for common notification types
export function useNotificationHelpers() {
  const { addNotification } = useNotification();

  const success = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({
        type: "success",
        title,
        message,
        duration,
      });
    },
    [addNotification]
  );

  const error = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({
        type: "error",
        title,
        message,
        duration,
      });
    },
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({
        type: "warning",
        title,
        message,
        duration,
      });
    },
    [addNotification]
  );

  const info = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({
        type: "info",
        title,
        message,
        duration,
      });
    },
    [addNotification]
  );

  return { success, error, warning, info };
}
