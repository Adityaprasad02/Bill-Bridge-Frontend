import { useState, useEffect, useCallback } from "react";
import { fetchMerchantBills, viewBillAsMerchant, deleteBill, fetchPaymentDetails, initiateRefund, getRefundStatus } from "@/api/billService";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">All Bills</CardTitle>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
              All Bills
            </CardTitle>
            <CardDescription className="mt-1">{totalElements} bill{totalElements !== 1 ? "s" : ""} total</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Rows per page:</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-18 border-zinc-700 bg-zinc-800/50 text-xs text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-800">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs text-zinc-200">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-sm">No bills found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const canResend = bill.billStatus !== "PAID";
              const isPaid = bill.billStatus === "PAID";
              const hasPayload = !!billPayloadCache?.[bill.billId];
              const pd = paymentDetailsMap[bill.billId];
              const rd = refundDetailsMap[bill.billId];

              const statusColor = isPaid ? "border-green-700/50 text-green-400"
                : bill.billStatus === "PENDING" ? "border-yellow-700/50 text-yellow-400"
                : bill.billStatus === "FAILED" || bill.billStatus === "DECLINED" ? "border-red-700/50 text-red-400"
                : "border-zinc-700 text-zinc-400";

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

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {/* Resend */}
                    <Button
                      size="sm"
                      variant={canResend ? "default" : "secondary"}
                      className={canResend ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed opacity-50"}
                      disabled={!canResend}
                      onClick={() => handleResend(bill)}
                    >
                      {canResend ? "Resend" : "Paid"}
                    </Button>
                    {/* View Bill */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                      onClick={() => handleViewBill(bill.billId)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                      View
                    </Button>
                    {/* Payment Details */}
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
                    {/* Refund */}
                    {isPaid && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            disabled={refundLoading[bill.billId]}
                          >
                            {refundLoading[bill.billId] ? (
                              <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                                Processing
                              </span>
                            ) : "Refund"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to initiate a refund of{" "}
                              <span className="font-semibold text-white">&#8377;{parseFloat(bill.billAmount).toFixed(2)}</span>{" "}
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
                    {/* Refund Status */}
                    {isPaid && rd && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-700/50 text-amber-300 hover:bg-amber-900/30 hover:text-amber-200"
                        disabled={refundStatusLoading[bill.billId]}
                        onClick={() => handleRefundStatus(bill.billId)}
                      >
                        {refundStatusLoading[bill.billId] ? "Checking..." : "Refund Status"}
                      </Button>
                    )}
                    {/* Delete */}
                    {canResend && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-700/50 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                        onClick={() => handleDeleteBill(bill.billId)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        Delete
                      </Button>
                    )}
                    {!hasPayload && canResend && (
                      <span className="text-xs text-zinc-500 italic">
                        Send from this session to enable resend
                      </span>
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

                  {/* Refund Details Panel */}
                  {rd && (
                    <div className="mt-2 rounded-lg border border-orange-800/30 bg-orange-950/20 p-4">
                      <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        Refund Details
                      </h5>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          ["Refund ID", rd.refundId || "—"],
                          ["Ref ID", rd.refId || "—"],
                          ["Order ID", rd.orderId || "—"],
                          ["Amount", `₹${parseFloat(rd.refundAmount || rd.totalRefundAmount || 0).toFixed(2)}`],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
                            <p className="mt-0.5 text-sm font-medium text-zinc-200">{value}</p>
                          </div>
                        ))}
                        <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Status</p>
                          <Badge variant="outline" className={`mt-1 gap-1 text-[10px] ${
                            rd.resultStatus === "TXN_SUCCESS" ? "border-green-700/50 text-green-400" :
                            rd.resultStatus === "PENDING" ? "border-yellow-700/50 text-yellow-400" : "border-red-700/50 text-red-400"
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {rd.resultStatus || rd.resultInfo?.resultStatus || "—"}
                          </Badge>
                        </div>
                        {rd.resultMsg && (
                          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Message</p>
                            <p className="mt-0.5 text-sm text-zinc-200">{rd.resultMsg}</p>
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

        {totalPages > 1 && (
          <div className="mt-4 flex flex-col items-center gap-2 border-t border-zinc-800 pt-4">
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
      </CardContent>
    </Card>
  );
}
