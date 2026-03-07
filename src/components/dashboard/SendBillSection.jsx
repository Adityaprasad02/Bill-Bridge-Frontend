import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Shows generated bills ready to be sent to customers via WebSocket.
 */
export default function SendBillSection({ bills, onSend }) {
  if (!bills || bills.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            Send Bill to Customer
          </CardTitle>
          <CardDescription>Generate a bill first to send it here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-sm">No bills queued for sending</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            Send Bill to Customer
          </CardTitle>
          <Badge variant="outline" className="border-blue-700/50 text-blue-400">{bills.length} ready</Badge>
        </div>
        <CardDescription>Bills generated and ready to be delivered</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {bills.map((item) => {
          const { billData, sendPayload, sent } = item;
          const showSend = billData.status !== "PAID" && !sent;

          return (
            <div
              key={billData.billId}
              className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 transition-colors hover:bg-zinc-800/80"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{billData.billMerchantDetails.merchantName}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-zinc-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    <span className="text-sm font-semibold text-white">{billData.billCustomerDetails.customerName}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Bill #{billData.billId} &middot; {billData.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">&#8377;{parseFloat(billData.amount).toFixed(2)}</p>
                  <Badge variant="outline" className={`mt-1 text-[10px] ${
                    billData.status === "PAID" ? "border-green-700/50 text-green-400"
                    : billData.status === "PENDING" ? "border-yellow-700/50 text-yellow-400"
                    : "border-zinc-700 text-zinc-400"
                  }`}>
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current inline-block" />
                    {billData.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-3">
                {showSend && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onSend(billData.billId, sendPayload)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    Send Bill
                  </Button>
                )}
                {sent && (
                  <Badge className="bg-zinc-700/50 text-zinc-400 gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Sent
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
