import { useState } from "react";
import { initiatePayment, verifyPayment } from "@/api/billService";
import { startPaytmCheckout } from "@/components/payments/PaytmPayment";

/**
 * Shows bills received via WebSocket for the customer.
 * Pay button → initiate → Paytm checkout → verify → send response to merchant.
 * Matches the "Received Bills" card + handleCustomerPay + verifyPaymentTransaction flow.
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
      // 1. Initiate payment with backend
      const initiateData = await initiatePayment(bill.billId);

      // 2. Launch Paytm checkout overlay
      startPaytmCheckout(
        {
          orderId: initiateData.orderId,
          txnToken: initiateData.body?.txnToken,
          amount: initiateData.amount,
        },
        async (paytmStatus) => {
          // 3. Paytm returns STATUS, RESPMSG, ORDERID
          alert(`${paytmStatus.STATUS} – ${paytmStatus.RESPMSG}`);

          try {
            // 4. Verify payment with backend
            const verifyData = await verifyPayment(paytmStatus.ORDERID);

            // 5. Build paymentResponse matching backend PaymentResponse record
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

            // 6. Send result to merchant via WebSocket
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
            console.error("Payment verification error:", err);
            alert("Payment verification failed: " + (err.message || err));
          } finally {
            setPayingIndex(null);
          }
        }
      );
    } catch (err) {
      console.error("Payment initiation error:", err);
      console.error("Response data:", err.response?.data);
      alert("Payment initiation failed: " + (err.response?.data?.error || err.message || err));
      setPayingIndex(null);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h4 className="mb-3 text-sm font-semibold text-zinc-200">
        💸 Received Bills
      </h4>

      {notifications.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 py-3">
          No bills received yet
        </p>
      ) : (
        <div className="space-y-2">
          {notifications.map((bill, i) => (
            <div
              key={`${bill.billId}-${i}`}
              className="rounded border border-zinc-700 bg-zinc-800 p-3"
            >
              <div className="font-semibold text-white text-sm">
                💸 Bill from {bill.merchantName}
              </div>
              <div className="text-xs text-zinc-400">
                Bill ID: {bill.billId}
              </div>
              <div className="mt-1 text-sm text-zinc-300">
                Amount: ₹{parseFloat(bill.amount).toFixed(2)}
              </div>
              <div className="text-sm text-zinc-300">Title: {bill.title}</div>
              <div className="text-xs text-zinc-400">
                Customer: {bill.customerName}
              </div>
              <div className="mt-2">
                <button
                  className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  disabled={payingIndex === i}
                  onClick={() => handlePay(bill, i)}
                >
                  {payingIndex === i
                    ? "Processing…"
                    : `Pay ₹${parseFloat(bill.amount).toFixed(2)}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
