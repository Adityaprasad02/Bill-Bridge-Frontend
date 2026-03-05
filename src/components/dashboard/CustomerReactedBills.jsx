import { useState, useEffect, useCallback } from "react";
import { fetchCustomerBills, viewBillAsCustomer } from "@/api/billService";
import { getStatusBadgeClasses, isReactedStatus } from "./statusUtils";

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
              <div className="mt-2">
                <button
                  className="rounded bg-cyan-700 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-800"
                  onClick={() => handleViewBill(bill.billId)}
                >
                  View Bill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
