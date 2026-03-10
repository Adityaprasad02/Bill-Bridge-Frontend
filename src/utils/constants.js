const backendURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const mid = import.meta.env.VITE_PAYTM_MID ;
export const SOCKET_URL = `${backendURL}/billbuddy`;

export const PAYTM_CONFIG = {
  MID: mid,
};

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  MERCHANT: "MERCHANT",
};