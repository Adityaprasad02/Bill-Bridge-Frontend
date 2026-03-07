import { useState, useEffect, useCallback } from "react";
import { fetchCustomerBills, viewBillAsCustomer, fetchPaymentDetails } from "@/api/billService";
import { getStatusBadgeClasses, isReactedStatus } from "./statusUtils";
import { toast } from "react-toastify";

/**
 * Periodically fetches customer bills with non-PENDING status ("reacted" bills).
 * Matches the "Reacted Bills" card in dashboard.html.
 */
export default function CustomerReactedBills({ userId }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchCustomerBills(userId);
      const arr = Array.isArray(data) ? data : [];
      setBills(arr.filter((b) => isReactedStatus(b.billStatus)));
    } catch (err) {
      // Don't log 401s - the axios interceptor handles token refresh
      if (err?.response?.status !== 401) {
        console.error("Failed to refresh customer bills:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const handleViewBill = async (billId) => {
    try {
      const data = await viewBillAsCustomer(billId);
      const url = data.signedURL || data.signedUrl;
      if (url?.trim().startsWith("http")) {
        window.open(url, "_blank", "noopener");
      } else {
        alert("Invalid bill URL received from server");
      }
    } catch (err) {
      alert("Error fetching bill: " + (err?.response?.data?.message || err.message));
    }
  };

  // ─── Payment Details ───
  const [paymentDetailsMap, setPaymentDetailsMap] = useState({});
  const [paymentLoading, setPaymentLoading] = useState({});

  const handleTogglePaymentDetails = async (billId) => {
    if (paymentDetailsMap[billId]) {
      setPaymentDetailsMap((prev) => { const n = { ...prev }; delete n[billId]; return n; });
      return;
    }
    setPaymentLoading((prev) => ({ ...prev, [billId]: true }));
    try {
      const data = await fetchPaymentDetails(billId);
      setPaymentDetailsMap((prev) => ({ ...prev, [billId]: data }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch payment details");
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [billId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
        <h4 className="mb-2 text-sm font-semibold text-zinc-200">✅ Reacted Bills</h4>
        <p className="text-center text-sm text-zinc-500 py-3">Loading…</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h4 className="mb-3 text-sm font-semibold text-zinc-200">✅ Reacted Bills</h4>

      {bills.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 py-3">
          No reacted bills yet
        </p>
      ) : (
        <div className="space-y-2">
          {bills.map((bill) => (
            <div
              key={bill.billId}
              className="rounded border border-zinc-700 bg-zinc-800 p-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-white text-sm">
                    {bill.billTitle}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Bill ID: {bill.billId}
                  </div>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium border ${getStatusBadgeClasses(bill.billStatus)}`}
                >
                  {bill.billStatus}
                </span>
              </div>
              <div className="mt-1 text-sm text-zinc-300">
                Amount: ₹{parseFloat(bill.billAmount).toFixed(2)}
              </div>
              <div className="text-xs text-zinc-400">
                Mode: {bill.paymentMode}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="rounded bg-cyan-700 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-800"
                  onClick={() => handleViewBill(bill.billId)}
                >
                  View Bill
                </button>
                {bill.billStatus === "PAID" && (
                  <button
                    className="rounded bg-violet-700 px-3 py-1 text-xs font-medium text-white hover:bg-violet-800 disabled:opacity-50"
                    disabled={paymentLoading[bill.billId]}
                    onClick={() => handleTogglePaymentDetails(bill.billId)}
                  >
                    {paymentLoading[bill.billId] ? "Loading…" : paymentDetailsMap[bill.billId] ? "Hide Details" : "Payment Details"}
                  </button>
                )}
              </div>

              {/* Payment Details Panel */}
              {paymentDetailsMap[bill.billId] && (() => {
                const pd = paymentDetailsMap[bill.billId];
                return (
                  <div className="mt-3 rounded border border-zinc-600 bg-zinc-900 p-3 text-xs">
                    <h5 className="font-semibold text-violet-300 mb-2">Payment Details</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-300">
                      <span className="text-zinc-500">Txn ID:</span><span>{pd.txnId || pd.TxnId}</span>
                      <span className="text-zinc-500">Order ID:</span><span>{pd.orderId}</span>
                      <span className="text-zinc-500">Bank Txn ID:</span><span>{pd.bankTxnId}</span>
                      <span className="text-zinc-500">Amount:</span><span>₹{parseFloat(pd.txnAmount).toFixed(2)}</span>
                      <span className="text-zinc-500">Txn Type:</span><span>{pd.txnType}</span>
                      <span className="text-zinc-500">Gateway:</span><span>{pd.gatewayName}</span>
                      <span className="text-zinc-500">Bank:</span><span>{pd.bankName}</span>
                      <span className="text-zinc-500">Status:</span>
                      <span className={pd.resultStatus === "TXN_SUCCESS" ? "text-green-400" : "text-red-400"}>{pd.resultStatus}</span>
                      <span className="text-zinc-500">Date:</span><span>{pd.txnDate}</span>
                      {pd.refundAmt != null && (
                        <><span className="text-zinc-500">Refund Amt:</span><span>₹{parseFloat(pd.refundAmt).toFixed(2)}</span></>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
