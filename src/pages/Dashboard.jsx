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

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
if (loading) return (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
      <p className="text-sm text-zinc-400">Loading dashboard...</p>
    </div>
  </div>
);

if (!me) {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card className="border-red-800/50 bg-red-950/30">
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <p className="font-medium text-red-300">Failed to load profile</p>
            <p className="text-sm text-red-400/70">Please check your session or try again.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ─── Mobile Header ─── */}
      <div className="mb-6 lg:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-0.5 text-sm text-zinc-400">
          Welcome back, <span className="font-medium text-zinc-300">{me.username}</span>
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ════════════════════════════════════════
             LEFT SIDEBAR
           ════════════════════════════════════════ */}
        <aside className="w-full shrink-0 lg:w-72 xl:w-80">
          <div className="space-y-4 lg:sticky lg:top-6">
            {/* ─── Profile Card ─── */}
            <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                    {me.username?.charAt(0).toUpperCase()}
                  </div>
                  <p className="mt-3 truncate text-lg font-semibold text-white">{me.username}</p>
                  <p className="truncate text-sm text-zinc-400">{me.email}</p>
                  <p className="mt-1 font-mono text-[11px] text-zinc-600">ID: {me.id}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Badge variant="outline" className={`gap-1.5 border-zinc-700 px-3 py-1 ${
                      role === "MERCHANT" ? "text-blue-400" : "text-purple-400"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                      {role}
                    </Badge>
                    <Badge variant="outline" className={`gap-1.5 px-3 py-1 ${
                      isConnected()
                        ? "border-green-700/50 text-green-400"
                        : "border-red-700/50 text-red-400"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${isConnected() ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                      {isConnected() ? "Live" : "Offline"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Merchant Status Card (sidebar, merchant only) ─── */}
            {role === "MERCHANT" && !merchantLoading && merchantData && (
              <Card className="border-green-800/30 bg-linear-to-br from-green-950/40 to-zinc-900/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/15">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                      <CardTitle className="text-sm text-white">Verified Merchant</CardTitle>
                      <CardDescription className="text-[11px] text-zinc-500">Active & verified</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-0">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Business</p>
                    <p className="mt-0.5 text-sm font-semibold text-white">{merchantData.businessName}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Type</p>
                    <div className="mt-0.5">
                      <Badge variant="outline" className={`gap-1 text-xs ${
                        merchantData.type === "ONLINE"
                          ? "border-blue-700/50 text-blue-400"
                          : "border-amber-700/50 text-amber-400"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {merchantData.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Address</p>
                    <p className="mt-0.5 text-sm text-zinc-300">{merchantData.address}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">GST Number</p>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-white">{merchantData.gstNumber}</p>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-600">{merchantData.merchantId}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </aside>

        {/* ════════════════════════════════════════
             MAIN CONTENT
           ════════════════════════════════════════ */}
        <main className="min-w-0 flex-1">
          {/* ─── Desktop Header ─── */}
          <div className="mb-6 hidden lg:block">
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Welcome back, <span className="font-medium text-zinc-300">{me.username}</span>
            </p>
          </div>

          {/* ════════════════════════════════════════
               MERCHANT VIEW
             ════════════════════════════════════════ */}
          {role === "MERCHANT" && (
            <>
              {merchantLoading && (
                <Card className="border-zinc-800 bg-zinc-900/80">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
                      <p className="text-sm text-zinc-400">Loading merchant info...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!merchantLoading && merchantData === false && (
                <MerchantRegisterForm onRegistered={loadMerchant} />
              )}

              {!merchantLoading && merchantData && (
                <Tabs defaultValue="bills" className="space-y-4">
                  <TabsList className="w-full bg-zinc-900 border border-zinc-800 overflow-x-auto">
                    <TabsTrigger value="bills" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs sm:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      <span className="hidden xs:inline">Create &</span> Send
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs sm:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="all-bills" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs sm:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                      All Bills
                    </TabsTrigger>
                    <TabsTrigger value="responses" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs sm:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" /></svg>
                      Responses
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bills" className="space-y-4">
                    <CreateBillForm onBillCreated={handleBillCreated} />
                    <SendBillSection bills={generatedBills} onSend={handleSendBill} />
                  </TabsContent>

                  <TabsContent value="upload">
                    <UploadBillPdf />
                  </TabsContent>

                  <TabsContent value="all-bills">
                    <MerchantBillsList
                      merchantId={merchantData.merchantId}
                      merchantData={merchantData}
                      merchantUsername={me?.username}
                      billPayloadCache={billPayloadCache.current}
                      onResend={handleResend}
                    />
                  </TabsContent>

                  <TabsContent value="responses">
                    <MerchantResponses responses={customerResponses} />
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}

          {/* ════════════════════════════════════════
               CUSTOMER VIEW
             ════════════════════════════════════════ */}
          {role === "CUSTOMER" && (
            <Tabs defaultValue="received" className="space-y-4">
              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="received" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs sm:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>
                  Received Bills
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs sm:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Bill History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="received">
                <CustomerReceivedBills
                  notifications={notifications}
                  sendPaymentResponse={sendPaymentResponse}
                  removeNotification={removeNotification}
                />
              </TabsContent>

              <TabsContent value="history">
                <CustomerReactedBills userId={me?.id} />
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}