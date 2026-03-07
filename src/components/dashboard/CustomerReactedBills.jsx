import { useState, useEffect, useCallback } from "react";
import { fetchCustomerBills, viewBillAsCustomer, fetchPaymentDetails } from "@/api/billService";
import { isReactedStatus } from "./statusUtils";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Periodically fetches customer bills with non-PENDING status ("reacted" bills).
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
      <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Bill History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-400" />
            <span className="ml-3 text-sm text-zinc-400">Loading bills...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
            Bill History
          </CardTitle>
          {bills.length > 0 && (
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">{bills.length} bill{bills.length !== 1 ? "s" : ""}</Badge>
          )}
        </div>
        <CardDescription>Your completed and processed bills</CardDescription>
      </CardHeader>

      <CardContent>
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="text-sm">No bill history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const isPaid = bill.billStatus === "PAID";
              const statusColor = isPaid ? "border-green-700/50 text-green-400"
                : bill.billStatus === "FAILED" || bill.billStatus === "DECLINED" ? "border-red-700/50 text-red-400"
                : "border-zinc-700 text-zinc-400";
              const pd = paymentDetailsMap[bill.billId];

              return (
                <div
                  key={bill.billId}
                  className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 transition-colors hover:bg-zinc-800/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{bill.billTitle}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">Bill #{bill.billId} &middot; {bill.paymentMode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">&#8377;{parseFloat(bill.billAmount).toFixed(2)}</p>
                      <Badge variant="outline" className={`mt-1 gap-1 text-[10px] ${statusColor}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {bill.billStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                      onClick={() => handleViewBill(bill.billId)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                      View Bill
                    </Button>
                    {isPaid && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-violet-700/50 text-violet-300 hover:bg-violet-900/30 hover:text-violet-200"
                        disabled={paymentLoading[bill.billId]}
                        onClick={() => handleTogglePaymentDetails(bill.billId)}
                      >
                        {paymentLoading[bill.billId] ? (
                          <span className="flex items-center gap-1.5">
                            <span className="h-3 w-3 animate-spin rounded-full border border-violet-400/30 border-t-violet-400" />
                            Loading
                          </span>
                        ) : pd ? "Hide Details" : "Payment Details"}
                      </Button>
                    )}
                  </div>

                  {/* Payment Details Panel */}
                  {pd && (
                    <div className="mt-3 rounded-lg border border-violet-800/30 bg-violet-950/20 p-4">
                      <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        Payment Details
                      </h5>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          ["Txn ID", pd.txnId || pd.TxnId],
                          ["Order ID", pd.orderId],
                          ["Bank Txn ID", pd.bankTxnId],
                          ["Amount", `₹${parseFloat(pd.txnAmount).toFixed(2)}`],
                          ["Txn Type", pd.txnType],
                          ["Gateway", pd.gatewayName],
                          ["Bank", pd.bankName],
                          ["Date", pd.txnDate],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
                            <p className="mt-0.5 text-sm font-medium text-zinc-200">{value || "—"}</p>
                          </div>
                        ))}
                        <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Status</p>
                          <Badge variant="outline" className={`mt-1 gap-1 text-[10px] ${pd.resultStatus === "TXN_SUCCESS" ? "border-green-700/50 text-green-400" : "border-red-700/50 text-red-400"}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {pd.resultStatus}
                          </Badge>
                        </div>
                        {pd.refundAmt != null && (
                          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Refund Amt</p>
                            <p className="mt-0.5 text-sm font-medium text-zinc-200">&#8377;{parseFloat(pd.refundAmt).toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
