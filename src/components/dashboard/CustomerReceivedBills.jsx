import { useState } from "react";
import { initiatePayment, verifyPayment } from "@/api/billService";
import { startPaytmCheckout } from "@/components/payments/PaytmPayment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Shows bills received via WebSocket for the customer.
 * Pay button → initiate → Paytm checkout → verify → send response to merchant.
 */
export default function CustomerReceivedBills({
  notifications,
  sendPaymentResponse,
  removeNotification,
}) {
  const [payingIndex, setPayingIndex] = useState(null);

  const handlePay = async (bill, index) => {
    if (!bill.merchantUserName?.trim()) {
      alert("Merchant info incomplete. Refresh and try again.");
      return;
    }

    if (!confirm(`Pay ₹${parseFloat(bill.amount).toFixed(2)}?`)) return;

    setPayingIndex(index);

    try {
      const initiateData = await initiatePayment(bill.billId);

      startPaytmCheckout(
        {
          orderId: initiateData.orderId,
          txnToken: initiateData.body?.txnToken,
          amount: initiateData.amount,
        },
        async (paytmStatus) => {
          alert(`${paytmStatus.STATUS} – ${paytmStatus.RESPMSG}`);

          try {
            const verifyData = await verifyPayment(paytmStatus.ORDERID);

            const paymentResponse = {
              billId: bill.billId,
              customerId: bill.customerId,
              customerName: bill.customerName,
              merchantId: bill.merchantId,
              merchantName: bill.merchantName,
              title: bill.title,
              status:
                verifyData.body?.resultInfo?.resultStatus ?? paytmStatus.STATUS,
              timestamp: new Date().toISOString(),
              amount: bill.amount,
            };

            const sent = sendPaymentResponse(
              paymentResponse,
              verifyData,
              bill.merchantUserName
            );

            if (sent) {
              setTimeout(() => {
                removeNotification(index);
                alert("Payment status sent to merchant!");
              }, 1000);
            } else {
              alert("WebSocket not connected. Refresh the page.");
            }
          } catch (err) {
            //console.error("Payment verification error:", err);
            alert("Payment verification failed: " + (err.message || err));
          } finally {
            setPayingIndex(null);
          }
        }
      );
    } catch (err) {
      //console.error("Payment initiation error:", err);
      //console.error("Response data:", err.response?.data);
      alert("Payment initiation failed: " + (err.response?.data?.error || err.message || err));
      setPayingIndex(null);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            Received Bills
          </CardTitle>
          {notifications.length > 0 && (
            <Badge variant="outline" className="border-green-700/50 text-green-400">{notifications.length} pending</Badge>
          )}
        </div>
        <CardDescription>Bills received from merchants awaiting payment</CardDescription>
      </CardHeader>

      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <p className="text-sm">No bills received yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((bill, i) => (
              <div
                key={`${bill.billId}-${i}`}
                className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 transition-colors hover:bg-zinc-800/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{bill.merchantName}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">Bill #{bill.billId} &middot; {bill.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">Customer: {bill.customerName}</p>
                  </div>
                  <p className="text-xl font-bold text-green-400">&#8377;{parseFloat(bill.amount).toFixed(2)}</p>
                </div>

                <div className="mt-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={payingIndex === i}
                    onClick={() => handlePay(bill, i)}
                  >
                    {payingIndex === i ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        Pay &#8377;{parseFloat(bill.amount).toFixed(2)}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
