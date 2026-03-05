import { useEffect, useState, useCallback, useRef } from "react";
import { connectSocket, disconnectSocket, sendSocketMessage, isSocketConnected } from "./socket";
import useAuthStore from "../auth/authStore";

/**
 * Hook that manages the WebSocket lifecycle: connect on mount, disconnect on unmount.
 * Returns notifications array + helpers to send messages and clear notifications.
 */
export default function useSocket() {
  const [notifications, setNotifications] = useState([]);
  const user = useAuthStore((s) => s.user);
  const role = user?.role; // "CUSTOMER" or "MERCHANT" (backend enum name)
  const getAccessToken = useCallback(() => useAuthStore.getState().accessToken, []);
  const disconnectRef = useRef(null);

  useEffect(() => {
    if (!role) return;

    const cleanRole = role.replace("ROLE_", ""); // in case it comes as ROLE_CUSTOMER
    disconnectRef.current = connectSocket(cleanRole, (msg) => {
      setNotifications((prev) => [...prev, msg]);
    }, getAccessToken);

    return () => {
      if (disconnectRef.current) disconnectRef.current();
    };
  }, [role, getAccessToken]);

  /** Send a bill from merchant → customer */
  const sendBill = useCallback((bill) => {
    console.log("Sending bill via WebSocket, routing to:", bill.customerName, "payload:", bill);
    return sendSocketMessage("/app/bill.send", bill, { customerName: bill.customerName });
  }, []);

  /** Send payment response from customer → merchant */
  const sendPaymentResponse = useCallback((paymentResponse, paymentData, merchantUserName) => {
    const payload = { paymentResponse, paymentData };
    return sendSocketMessage("/app/bill.response", payload, { merchantUserName });
  }, []);

  /** Remove a notification by index */
  const removeNotification = useCallback((index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /** Clear all notifications */
  const clearNotifications = useCallback(() => setNotifications([]), []);

  return {
    notifications,
    sendBill,
    sendPaymentResponse,
    removeNotification,
    clearNotifications,
    isConnected: isSocketConnected,
  };
}