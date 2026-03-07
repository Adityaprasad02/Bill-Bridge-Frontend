import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Shows customer payment responses received by the merchant via WebSocket.
 */
export default function MerchantResponses({ responses }) {
  if (!responses || responses.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" /></svg>
            Customer Responses
          </CardTitle>
          <CardDescription>Real-time payment responses from customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <p className="text-sm">No responses from customers yet</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
            Customer Responses
          </CardTitle>
          <Badge variant="outline" className="border-blue-700/50 text-blue-400">{responses.length} received</Badge>
        </div>
        <CardDescription>Real-time payment responses from customers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {responses.map((r, i) => {
          const isSuccess = r.status === "TXN_SUCCESS";
          const isFailed = r.status === "TXN_FAILURE";
          const borderAccent = isSuccess ? "border-l-green-500" : isFailed ? "border-l-red-500" : "border-l-yellow-500";
          const statusColor = isSuccess ? "border-green-700/50 text-green-400"
            : isFailed ? "border-red-700/50 text-red-400"
            : "border-yellow-700/50 text-yellow-400";

          return (
            <div
              key={`${r.billId}-${i}`}
              className={`rounded-lg border border-zinc-800 border-l-4 ${borderAccent} bg-zinc-800/50 p-4 transition-colors hover:bg-zinc-800/80`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{r.customerName}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Customer #{r.customerId} &middot; Bill #{r.billId}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">&#8377;{r.amount ? parseFloat(r.amount).toFixed(2) : "N/A"}</p>
                  <Badge variant="outline" className={`mt-1 gap-1 text-[10px] ${statusColor}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {r.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Merchant</p>
                  <p className="mt-0.5 text-sm text-zinc-300">{r.merchantName}</p>
                </div>
                <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Bill Title</p>
                  <p className="mt-0.5 text-sm text-zinc-300">{r.title}</p>
                </div>
              </div>

              <p className="mt-2 text-right text-[11px] text-zinc-600">
                {r.receivedAt || new Date().toLocaleString()}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
