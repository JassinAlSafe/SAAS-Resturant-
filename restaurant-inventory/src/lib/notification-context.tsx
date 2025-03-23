"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

// Define notification types
export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

// Define the notification context type
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Create the context with default values
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

// Create a provider component
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }, []);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000, // Default duration: 5 seconds
    };

    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [removeNotification]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Create a hook to use the notification context
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

// Export notification helper functions for use in components
export function useNotificationHelpers() {
  const { addNotification } = useNotification();
  
  const showSuccess = useCallback((message: string) => {
    addNotification({ type: "success", message });
  }, [addNotification]);
  
  const showError = useCallback((message: string) => {
    addNotification({ type: "error", message });
  }, [addNotification]);
  
  const showInfo = useCallback((message: string) => {
    addNotification({ type: "info", message });
  }, [addNotification]);
  
  const showWarning = useCallback((message: string) => {
    addNotification({ type: "warning", message });
  }, [addNotification]);
  
  return {
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
}
