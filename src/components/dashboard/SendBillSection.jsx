import { getStatusBadgeClasses } from "./statusUtils";

/**
 * Shows generated bills ready to be sent to customers via WebSocket.
 * Matches the "Send Bill to Customer" section in dashboard.html.
 */
export default function SendBillSection({ bills, onSend }) {
  // bills = array of { billData, sendPayload, sent }
  if (!bills || bills.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
        <h4 className="mb-2 text-sm font-semibold text-zinc-200">
          📤 Send Bill to Customer
        </h4>
        <p className="text-center text-sm text-zinc-500 py-3">
          Generate a bill first to send it to customer
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h4 className="mb-3 text-sm font-semibold text-zinc-200">
        📤 Send Bill to Customer
      </h4>
      <div className="space-y-2">
        {bills.map((item) => {
          const { billData, sendPayload, sent } = item;
          const showSend = billData.status !== "PAID" && !sent;

          return (
            <div
              key={billData.billId}
              className="rounded border border-zinc-700 bg-zinc-800 p-3"
            >
              <div className="font-semibold text-white text-sm">
                📋 {billData.billMerchantDetails.merchantName} →{" "}
                {billData.billCustomerDetails.customerName}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Bill ID: {billData.billId}
              </div>
              <div className="text-sm text-zinc-300 mt-1">
                Title: {billData.title}
              </div>
              <div className="text-sm text-zinc-300">
                Amount: ₹{parseFloat(billData.amount).toFixed(2)}
              </div>
              <div className="text-sm mt-1">
                Status:{" "}
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium border ${getStatusBadgeClasses(billData.status)}`}
                >
                  {billData.status}
                </span>
              </div>

              {showSend && (
                <button
                  className="mt-2 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                  onClick={() => onSend(billData.billId, sendPayload)}
                >
                  Send Bill
                </button>
              )}
              {sent && (
                <span className="mt-2 inline-block rounded bg-zinc-700 px-3 py-1 text-xs text-zinc-400">
                  ✓ Sent
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
