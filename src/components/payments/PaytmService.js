import api from "@/api/axios";

export const initiatePaytmPayment = async (billId) => {
  const res = await api.post(`/initiate/payment/${billId}`);
  return res.data;
};

export const verifyPaytmPayment = async (orderId) => {
  const res = await api.post(`/verify/payment/${orderId}`);
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