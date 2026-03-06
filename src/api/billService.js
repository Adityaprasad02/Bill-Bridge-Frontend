import api from "@/api/axios";

// ─── Merchant ───

export const registerMerchant = async (data) => {
  const res = await api.post("/merchant/register", data);
  return res.data;
};

export const getMerchantDetails = async () => {
  const res = await api.get("/merchant/getDetails");
  return res.data;
};

export const createBill = async (customerId, data) => {
  const res = await api.post(`/merchant/bill/${customerId}`, data);
  return res.data;
};

export const fetchMerchantBills = async (merchantId) => {
  const res = await api.get(`/merchant/fetch/bill/${merchantId}`);
  return res.data;
};

export const uploadBillPdf = async (billId, file) => {
  const form = new FormData();
  form.append("file", file);

  try {
    const response = await api.post(
      `/merchant/upload/bill/${billId}`,
      form
    );

    return response.data;

  } catch (error) {
    console.error("Upload failed:", error);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    console.error("Request headers:", error.config?.headers);
    throw error;
  }
};

export const viewBillAsMerchant = async (billId) => {
  const res = await api.get(`/merchant/view/bill/${billId}`);
  return res.data;
};

export const savePaymentData = async (billId, paymentData) => {
  const res = await api.post(`/merchant/save/payment/data/${billId}`, paymentData);
  return res.data;
};

export const updateBillStatus = async (billId, status) => {
  const res = await api.put(`/merchant/update/bill/status/${billId}/${status}`);
  return res.data;
};

// ─── Customer ───

export const fetchCustomerBills = async (customerId) => {
  const res = await api.get(`/customer/fetch/bill/${customerId}`);
  return res.data;
};

export const viewBillAsCustomer = async (billId) => {
  const res = await api.get(`/customer/view/bill/${billId}`);
  return res.data;
};

// ─── Payment ───

export const initiatePayment = async (billId) => {
  const res = await api.post(`/initiate/payment/${billId}`);
  return res.data;
};

export const verifyPayment = async (orderId) => {
  const res = await api.post(`/verify/payment/${orderId}`);
  return res.data;
};
