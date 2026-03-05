import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { SOCKET_URL } from "../../utils/constants.js";

let stompClient = null;
let isConnecting = false;
let reconnectTimer = null;

/**
 * Connect to the WebSocket with auth token.
 * @param {string} role - "CUSTOMER" or "MERCHANT"
 * @param {Function} onMessage - callback receiving parsed notification objects
 * @param {Function} getAccessToken - function that returns the current access token
 * @returns {Function} disconnect function
 */
export const connectSocket = (role, onMessage, getAccessToken) => {
  if (stompClient?.connected) {
    console.log("Socket already connected");
    return () => disconnectSocket();
  }

  if (isConnecting) {
    console.log("Socket connection in progress");
    return () => disconnectSocket();
  }

  isConnecting = true;

  // Include token in the SockJS URL so the initial HTTP handshake passes auth
  const token = getAccessToken();
  const socketUrl = token ? `${SOCKET_URL}?token=${encodeURIComponent(token)}` : SOCKET_URL;
  const socket = new SockJS(socketUrl);
  stompClient = Stomp.over(socket);

  // Enable STOMP debug logging temporarily
  stompClient.debug = (str) => console.log("STOMP:", str);

  const headers = { role };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  stompClient.connect(
    headers,
    // success
    () => {
      isConnecting = false;
      console.log("WebSocket connected");

      stompClient.subscribe("/user/queue/notify", (msg) => {
        if (msg.body) {
          try {
            onMessage(JSON.parse(msg.body));
          } catch (err) {
            console.error("Failed to parse socket message:", err);
          }
        }
      });
    },
    // error
    (error) => {
      console.error("WebSocket connection error:", error);
      isConnecting = false;
      stompClient = null;
      scheduleReconnect(role, onMessage, getAccessToken);
    }
  );

  socket.onclose = () => {
    console.warn("WebSocket closed");
    stompClient = null;
    isConnecting = false;
    scheduleReconnect(role, onMessage, getAccessToken);
  };

  return () => disconnectSocket();
};

function scheduleReconnect(role, onMessage, getAccessToken) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    console.log("Attempting WebSocket reconnect...");
    connectSocket(role, onMessage, getAccessToken);
  }, 5000);
}

export const disconnectSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (stompClient?.connected) {
    stompClient.disconnect(() => console.log("WebSocket disconnected"));
  }
  stompClient = null;
  isConnecting = false;
};

/**
 * Send a STOMP message (e.g. bill.send or bill.response)
 */
export const sendSocketMessage = (destination, payload, headers = {}) => {
  if (!stompClient?.connected) {
    console.error("Cannot send: WebSocket not connected");
    return false;
  }
  stompClient.send(destination, headers, JSON.stringify(payload));
  return true;
};

export const isSocketConnected = () => stompClient?.connected ?? false;