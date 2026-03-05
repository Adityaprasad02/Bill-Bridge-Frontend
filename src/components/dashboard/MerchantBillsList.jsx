import { useState, useEffect, useCallback } from "react";
import { fetchMerchantBills, viewBillAsMerchant } from "@/api/billService";
import { getStatusBadgeClasses } from "./statusUtils";

/**
 * Periodically fetches all merchant bills and renders them.
 * Supports resend (if billPayloadCache has the payload for that bill) and view bill.
 * Matches "All Bills" section in dashboard.html.
 */
export default function MerchantBillsList({ merchantId, merchantData, merchantUsername, billPayloadCache, onResend }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!merchantId) return;
    try {
      const data = await fetchMerchantBills(merchantId);
      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to refresh merchant bills:", err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const handleViewBill = async (billId) => {
    try {
      const data = await viewBillAsMerchant(billId);
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

  const handleResend = (bill) => {
    // Use cached payload first (has full customer details from bill creation)
    const cached = billPayloadCache?.[bill.billId];
    if (cached) {
      // Ensure merchantUserName is set
      const payload = { ...cached, merchantUserName: cached.merchantUserName || merchantUsername || "" };
      onResend?.(bill.billId, payload);
      return;
    }
    alert("Cannot resend: customer details not available. Create and send the bill again.");
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
        <h4 className="mb-2 text-sm font-semibold text-zinc-200">📚 All Bills</h4>
        <p className="text-center text-sm text-zinc-500 py-3">Loading…</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h4 className="mb-3 text-sm font-semibold text-zinc-200">📚 All Bills</h4>

      {bills.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 py-3">No bills found</p>
      ) : (
        <div className="space-y-2">
          {bills.map((bill) => {
            const canResend = bill.billStatus !== "PAID";
            const hasPayload = !!billPayloadCache?.[bill.billId];

            return (
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
                    className={`rounded px-3 py-1 text-xs font-medium ${
                      canResend && hasPayload
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : canResend
                        ? "bg-blue-600/50 text-white/70 hover:bg-blue-700"
                        : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                    }`}
                    disabled={!canResend}
                    onClick={() => handleResend(bill)}
                  >
                    {canResend ? "Resend" : "Paid"}
                  </button>
                  <button
                    className="rounded bg-cyan-700 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-800"
                    onClick={() => handleViewBill(bill.billId)}
                  >
                    View Bill
                  </button>
                  {!hasPayload && canResend && (
                    <span className="text-xs text-zinc-500">
                      Send from this session to enable resend
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
