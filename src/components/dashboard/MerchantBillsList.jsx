import { useState, useEffect, useCallback } from "react";
import { fetchMerchantBills, viewBillAsMerchant, deleteBill, fetchPaymentDetails, initiateRefund, getRefundStatus } from "@/api/billService";
import { getStatusBadgeClasses } from "./statusUtils";
import { toast } from "react-toastify";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE_OPTIONS = [3 , 5, 10, 20, 50];

/**
 * Periodically fetches all merchant bills and renders them.
 * Supports resend (if billPayloadCache has the payload for that bill) and view bill.
 * Matches "All Bills" section in dashboard.html.
 */
export default function MerchantBillsList({ merchantId, merchantData, merchantUsername, billPayloadCache, onResend }) {
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const totalElements = allBills.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 0;
  const bills = allBills.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const refresh = useCallback(async () => {
    if (!merchantId) return;
    try {
      const data = await fetchMerchantBills(merchantId);
      // Handle both paginated (Spring Page) and flat array responses
      if (Array.isArray(data)) {
        setAllBills(data);
      } else if (Array.isArray(data.content)) {
        setAllBills(data.content);
      } else {
        setAllBills([]);
      }
    } catch (err) {
      console.error("Failed to refresh merchant bills:", err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    setLoading(true);
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

  // ─── Delete Bill ───
  const handleDeleteBill = async (billId) => {
    if (!confirm(`Are you sure you want to delete bill #${billId}?`)) return;
    try {
      const msg = await deleteBill(billId);
      toast.success(msg || "Bill deleted successfully");
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data || "Failed to delete bill");
    }
  };

  // ─── Payment Details (expand/collapse per bill) ───
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

  // ─── Refund ───
  const [refundLoading, setRefundLoading] = useState({});

  const handleRefund = async (bill) => {
    const pd = paymentDetailsMap[bill.billId];
    if (!pd) {
      toast.info("Fetch payment details first to initiate refund");
      return;
    }
    setRefundLoading((prev) => ({ ...prev, [bill.billId]: true }));
    try {
      const data = await initiateRefund(pd.id, bill.billAmount);
      if (data.message === "refund Already initiated") {
        toast.warn("Refund already initiated for this bill");
      } else {
        toast.success(data.message || "Refund initiated successfully");
      }
      if (data.refundDetails) {
        setRefundDetailsMap((prev) => ({ ...prev, [bill.billId]: data.refundDetails }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Refund failed");
    } finally {
      setRefundLoading((prev) => ({ ...prev, [bill.billId]: false }));
    }
  };

  // ─── Refund Status ───
  const [refundDetailsMap, setRefundDetailsMap] = useState({});
  const [refundStatusLoading, setRefundStatusLoading] = useState({});

  const handleRefundStatus = async (billId) => {
    const pd = paymentDetailsMap[billId];
    const rd = refundDetailsMap[billId];
    const orderId = pd?.orderId || rd?.orderId;
    const refId = rd?.refId;
    if (!orderId || !refId) {
      toast.info("Initiate refund first or fetch payment details to check refund status");
      return;
    }
    setRefundStatusLoading((prev) => ({ ...prev, [billId]: true }));
    try {
      const data = await getRefundStatus(orderId, refId);
      const body = data.body || data;
      const resultInfo = body.resultInfo || {};
      if (resultInfo.resultStatus === "TXN_SUCCESS") {
        toast.success(`Refund successful — ₹${body.refundAmount || body.totalRefundAmount}`);
        setRefundDetailsMap((prev) => ({ ...prev, [billId]: { ...prev[billId], ...body, resultStatus: "TXN_SUCCESS" } }));
      } else if (resultInfo.resultStatus === "PENDING") {
        toast.warn(`Refund pending — ${resultInfo.resultMsg || "Please check later"}`);
        setRefundDetailsMap((prev) => ({ ...prev, [billId]: { ...prev[billId], ...body, resultStatus: "PENDING" } }));
      } else {
        toast.error(`Refund status: ${resultInfo.resultStatus || "UNKNOWN"} — ${resultInfo.resultMsg || ""}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to check refund status");
    } finally {
      setRefundStatusLoading((prev) => ({ ...prev, [billId]: false }));
    }
  };

  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setCurrentPage(0);
  };

  const getPageNumbers = () => {
    if (totalPages <= 1) return [];
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
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
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-200">📚 All Bills</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Rows:</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-7 w-[70px] bg-zinc-800 border-zinc-600 text-zinc-200 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-600">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-zinc-200 text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {totalElements > 0 && (
            <span className="text-xs text-zinc-500">({totalElements} total)</span>
          )}
        </div>
      </div>

      {bills.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 py-3">No bills found</p>
      ) : (
        <div className="space-y-2">
          {bills.map((bill) => {
            const canResend = bill.billStatus !== "PAID";
            const isPaid = bill.billStatus === "PAID";
            const hasPayload = !!billPayloadCache?.[bill.billId];
            const pd = paymentDetailsMap[bill.billId];
            const rd = refundDetailsMap[bill.billId];

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
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* Resend */}
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
                  {/* View Bill */}
                  <button
                    className="rounded bg-cyan-700 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-800"
                    onClick={() => handleViewBill(bill.billId)}
                  >
                    View Bill
                  </button>
                  {/* Payment Details (only for PAID) */}
                  {isPaid && (
                    <button
                      className="rounded bg-violet-700 px-3 py-1 text-xs font-medium text-white hover:bg-violet-800 disabled:opacity-50"
                      disabled={paymentLoading[bill.billId]}
                      onClick={() => handleTogglePaymentDetails(bill.billId)}
                    >
                      {paymentLoading[bill.billId] ? "Loading…" : pd ? "Hide Details" : "Payment Details"}
                    </button>
                  )}
                  {/* Refund (only for PAID) */}
                  {isPaid && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="rounded bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                          disabled={refundLoading[bill.billId]}
                        >
                          {refundLoading[bill.billId] ? "Processing…" : "Refund"}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to initiate a refund of{" "}
                            <span className="font-semibold text-white">₹{parseFloat(bill.billAmount).toFixed(2)}</span>{" "}
                            for bill <span className="font-mono text-white">#{bill.billId}</span>?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-orange-600 text-white hover:bg-orange-700"
                            onClick={() => handleRefund(bill)}
                          >
                            Yes, Initiate Refund
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {/* Refund Status (only when refund details exist) */}
                  {isPaid && rd && (
                    <button
                      className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                      disabled={refundStatusLoading[bill.billId]}
                      onClick={() => handleRefundStatus(bill.billId)}
                    >
                      {refundStatusLoading[bill.billId] ? "Checking…" : "Refund Status"}
                    </button>
                  )}
                  {/* Delete (only non-PAID) */}
                  {canResend && (
                    <button
                      className="rounded bg-red-700 px-3 py-1 text-xs font-medium text-white hover:bg-red-800"
                      onClick={() => handleDeleteBill(bill.billId)}
                    >
                      Delete
                    </button>
                  )}
                  {!hasPayload && canResend && (
                    <span className="text-xs text-zinc-500">
                      Send from this session to enable resend
                    </span>
                  )}
                </div>

                {/* Payment Details Panel */}
                {pd && (
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
                )}

                {/* Refund Details Panel */}
                {rd && (
                  <div className="mt-2 rounded border border-zinc-600 bg-zinc-900 p-3 text-xs">
                    <h5 className="font-semibold text-orange-300 mb-2">Refund Details</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-300">
                      <span className="text-zinc-500">Refund ID:</span><span>{rd.refundId || "—"}</span>
                      <span className="text-zinc-500">Ref ID:</span><span>{rd.refId || "—"}</span>
                      <span className="text-zinc-500">Order ID:</span><span>{rd.orderId || "—"}</span>
                      <span className="text-zinc-500">Amount:</span><span>₹{parseFloat(rd.refundAmount || rd.totalRefundAmount || 0).toFixed(2)}</span>
                      <span className="text-zinc-500">Status:</span>
                      <span className={
                        rd.resultStatus === "TXN_SUCCESS" ? "text-green-400" :
                        rd.resultStatus === "PENDING" ? "text-yellow-400" : "text-red-400"
                      }>{rd.resultStatus || rd.resultInfo?.resultStatus || "—"}</span>
                      {rd.resultMsg && (
                        <><span className="text-zinc-500">Message:</span><span>{rd.resultMsg}</span></>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <span className="text-xs text-zinc-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {getPageNumbers()[0] > 0 && (
                <>
                  <PaginationItem>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(0); }} className="cursor-pointer text-zinc-200">
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {getPageNumbers()[0] > 1 && (
                    <PaginationItem>
                      <PaginationEllipsis className="text-zinc-400" />
                    </PaginationItem>
                  )}
                </>
              )}

              {getPageNumbers().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                    className="cursor-pointer text-zinc-200"
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {getPageNumbers().length > 0 && getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                <>
                  {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis className="text-zinc-400" />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages - 1); }} className="cursor-pointer text-zinc-200">
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
