"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Notification, useNotification } from "@/lib/notification-context";

const notificationIcons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const notificationColors = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-amber-50 border-amber-200",
  info: "bg-blue-50 border-blue-200",
};

const notificationTitleColors = {
  success: "text-green-800",
  error: "text-red-800",
  warning: "text-amber-800",
  info: "text-blue-800",
};

const notificationMessageColors = {
  success: "text-green-700",
  error: "text-red-700",
  warning: "text-amber-700",
  info: "text-blue-700",
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotification();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative flex items-start p-4 mb-3 rounded-lg border shadow-sm ${
        notificationColors[notification.type]
      }`}
    >
      <div className="shrink-0 mr-3">
        {notificationIcons[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className={`text-sm font-medium ${
            notificationTitleColors[notification.type]
          }`}
        >
          {notification.title}
        </h3>
        <div
          className={`mt-1 text-sm ${
            notificationMessageColors[notification.type]
          }`}
        >
          {notification.message}
        </div>
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="ml-4 shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-hidden"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function NotificationContainer() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}
