import { getStatusBadgeClasses } from "./statusUtils";

/**
 * Shows customer payment responses received by the merchant via WebSocket.
 * Matches the "Customer Bill Response" card in dashboard.html.
 */
export default function MerchantResponses({ responses }) {
  if (!responses || responses.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
        <h4 className="mb-2 text-sm font-semibold text-zinc-200">
          📥 Customer Bill Responses
        </h4>
        <p className="text-center text-sm text-zinc-500 py-3">
          No responses from customers yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h4 className="mb-3 text-sm font-semibold text-zinc-200">
        📥 Customer Bill Responses
      </h4>
      <div className="space-y-2">
        {responses.map((r, i) => {
          const borderColor =
            r.status === "TXN_SUCCESS"
              ? "border-l-green-500"
              : r.status === "TXN_FAILURE"
                ? "border-l-red-500"
                : "border-l-yellow-500";

          return (
            <div
              key={`${r.billId}-${i}`}
              className={`rounded border border-zinc-700 border-l-4 ${borderColor} bg-zinc-800 p-3`}
            >
              <div className="font-semibold text-white text-sm">
                💬 Response from {r.customerName}
              </div>
              <div className="text-xs text-zinc-400">
                Customer ID: {r.customerId}
              </div>
              <div className="mt-1 text-sm text-zinc-300">
                Merchant Name: {r.merchantName}
              </div>
              <div className="text-sm text-zinc-300">Bill ID: {r.billId}</div>
              <div className="text-sm text-zinc-300">
                Bill Title: {r.title}
              </div>
              <div className="text-sm text-zinc-300">
                Amount: ₹{r.amount ? parseFloat(r.amount).toFixed(2) : "N/A"}
              </div>
              <div className="text-sm mt-1">
                Status:{" "}
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium border ${getStatusBadgeClasses(r.status)}`}
                >
                  {r.status}
                </span>
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Received: {r.receivedAt || new Date().toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
