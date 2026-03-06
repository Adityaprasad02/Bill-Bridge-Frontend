import { useEffect, useState, useRef, useCallback } from "react";
import useSocket from "../features/socket/socketService";
import useAuthStore from "../features/auth/authStore";
import { getMe } from "@/features/auth/authService";
import { getMerchantDetails, savePaymentData, updateBillStatus } from "@/api/billService";

import MerchantRegisterForm from "@/components/dashboard/MerchantRegisterForm";
import CreateBillForm from "@/components/dashboard/CreateBillForm";
import UploadBillPdf from "@/components/dashboard/UploadBillPdf";
import SendBillSection from "@/components/dashboard/SendBillSection";
import MerchantBillsList from "@/components/dashboard/MerchantBillsList";
import MerchantResponses from "@/components/dashboard/MerchantResponses";
import CustomerReceivedBills from "@/components/dashboard/CustomerReceivedBills";
import CustomerReactedBills from "@/components/dashboard/CustomerReactedBills";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Merchant-specific state
  const [merchantData, setMerchantData] = useState(null); // null = not loaded, false = not merchant
  const [merchantLoading, setMerchantLoading] = useState(false);

  // Generated bills waiting to be sent
  const [generatedBills, setGeneratedBills] = useState([]); // { billData, sendPayload, sent }

  // Cache of sendPayloads by billId — used for resend
  const billPayloadCache = useRef({});

  // Customer responses received via WebSocket
  const [customerResponses, setCustomerResponses] = useState([]);

  const {
    notifications,
    sendBill,
    sendPaymentResponse,
    removeNotification,
    isConnected,
  } = useSocket();

  const role = (me?.role || user?.role || "").replace("ROLE_", "");

  // ─── Load user profile ───
  useEffect(() => {
  getMe()
    .then((response) => {
      console.log("✅ getMe response:", response);
      setMe(response);
      // Keep store user in sync with fresh data
      useAuthStore.getState().setUser(response);
    })
    .catch((error) => {
      console.error("❌ getMe error:", error);
    })
    .finally(() => setLoading(false));
}, []);

  // ─── Load merchant details (MERCHANT only) ───
  const loadMerchant = useCallback(async () => {
    setMerchantLoading(true);
    try {
      const data = await getMerchantDetails();
      setMerchantData(data);
    } catch {
      setMerchantData(false);
    } finally {
      setMerchantLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "MERCHANT") loadMerchant();
  }, [role, loadMerchant]);

  // ─── MERCHANT: process incoming payment notifications from WebSocket ───
  const processedRef = useRef(new Set());

  useEffect(() => {
    if (role !== "MERCHANT" || notifications.length === 0) return;

    notifications.forEach((notif, idx) => {
      if (processedRef.current.has(idx)) return;
      if (!notif?.paymentData || !notif?.paymentResponse) return;

      processedRef.current.add(idx);
      const { paymentData, paymentResponse } = notif;

      // Persist to backend
      savePaymentData(paymentResponse.billId, paymentData).catch(console.error);
      updateBillStatus(paymentResponse.billId, paymentResponse.status).catch(console.error);

      // Add to visible responses
      setCustomerResponses((prev) => [
        { ...paymentResponse, receivedAt: new Date().toLocaleString() },
        ...prev,
      ]);

      // Cache payload for resend
      billPayloadCache.current[paymentResponse.billId] = {
        customerName: paymentResponse.customerName,
        billId: paymentResponse.billId,
        title: paymentResponse.title,
        amount: paymentResponse.amount,
        merchantName: paymentResponse.merchantName,
        merchantUserName: me?.username || "",
        merchantId: paymentResponse.merchantId,
        customerId: paymentResponse.customerId,
      };
    });
  }, [notifications, role, merchantData]);

  // ─── MERCHANT: bill created callback ───
  const handleBillCreated = (billData, sendPayload) => {
    // Ensure merchantUserName is set from logged-in user
    const payload = { ...sendPayload, merchantUserName: sendPayload.merchantUserName || me?.username || "" };
    billPayloadCache.current[billData.billId] = payload;
    setGeneratedBills((prev) => [{ billData, sendPayload: payload, sent: false }, ...prev]);
  };

  // ─── MERCHANT: send bill via WebSocket ───
  const handleSendBill = (billId, payload) => {
    const ok = sendBill(payload);
    if (ok) {
      setGeneratedBills((prev) =>
        prev.map((b) =>
          b.billData.billId === billId ? { ...b, sent: true } : b
        )
      );
    } else {
      alert("WebSocket not connected. Please refresh the page and try again.");
    }
  };

  // ─── MERCHANT: resend bill from All Bills list ───
  const handleResend = (billId, payload) => {
    const ok = sendBill(payload);
    if (ok) {
      alert("Bill resent successfully!");
    } else {
      alert("WebSocket not connected. Please refresh the page and try again.");
    }
  };
if (loading) return <div className="p-6 text-white">Loading dashboard…</div>;

if (!me) {
  return (
    <div className="p-6 text-red-400">
      ❌ Failed to load profile. Please check your session or try again.
    </div>
  );
}

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="mb-1 text-2xl font-semibold text-white">User Dashboard</h2>
      {me && (
        <div className="mb-6 text-sm text-zinc-400 space-y-0.5">
          <p><b>ID:</b> {me.id}</p>
          <p><b>Username:</b> {me.username}</p>
          <p><b>Email:</b> {me.email}</p>
          <p><b>Role:</b> {me.role}</p>
          <p>
            <b>WebSocket:</b>{" "}
            <span className={isConnected() ? "text-green-400" : "text-red-400"}>
              {isConnected() ? "Connected ✓" : "Disconnected ✗"}
            </span>
          </p>
        </div>
      )}

      {/* ════════════════════════════════════════
           MERCHANT VIEW
         ════════════════════════════════════════ */}
      {role === "MERCHANT" && (
        <>
          {merchantLoading && (
            <p className="text-zinc-500">Loading merchant info…</p>
          )}

          {/* Not registered → show register form */}
          {!merchantLoading && merchantData === false && (
            <MerchantRegisterForm onRegistered={loadMerchant} />
          )}

          {/* Already registered → show details + bill sections */}
          {!merchantLoading && merchantData && (
            <>
              <div className="mb-4 rounded-lg border border-green-700/40 bg-green-900/20 p-4">
                <p className="text-green-300 text-sm font-medium mb-2">
                  You are already registered as a Merchant ✓
                </p>
                <h4 className="text-white font-semibold mb-1">Merchant Details</h4>
                <pre className="text-xs text-zinc-400 overflow-auto max-h-40">
                  {JSON.stringify(merchantData, null, 2)}
                </pre>
              </div>

              {/* Bill Management */}
              <h3 className="mb-3 text-lg font-medium text-zinc-200">
                📬 Bill Management
              </h3>

              <div className="space-y-4">
                <CreateBillForm onBillCreated={handleBillCreated} />
                <SendBillSection bills={generatedBills} onSend={handleSendBill} />
                <UploadBillPdf />
                <MerchantBillsList
                  merchantId={merchantData.merchantId}
                  merchantData={merchantData}
                  merchantUsername={me?.username}
                  billPayloadCache={billPayloadCache.current}
                  onResend={handleResend}
                />
                <MerchantResponses responses={customerResponses} />
              </div>
            </>
          )}
        </>
      )}

      {/* ════════════════════════════════════════
           CUSTOMER VIEW
         ════════════════════════════════════════ */}
      {role === "CUSTOMER" && (
        <>
          <h3 className="mb-3 text-lg font-medium text-zinc-200">📬 My Bills</h3>
          <div className="space-y-4">
            <CustomerReceivedBills
              notifications={notifications}
              sendPaymentResponse={sendPaymentResponse}
              removeNotification={removeNotification}
            />
            <CustomerReactedBills userId={me?.id} />
          </div>
        </>
      )}
    </div>
  );
}