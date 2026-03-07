import { useState } from "react";
import { createBill } from "@/api/billService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateBillForm({ onBillCreated }) {
  const [form, setForm] = useState({
    customerId: "",
    amount: "",
    title: "",
    billLocation: "",
    mode: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const { customerId, amount, title, mode, status } = form;
    if (!customerId || !amount || !title || !mode || !status) {
      setError("Please fill all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      const billData = await createBill(customerId, {
        amount: parseFloat(amount),
        title: title.trim(),
        billLocation: form.billLocation.trim() || null,
        mode,
        status,
      });

      setResult(billData);

      console.log("createBill response:", JSON.stringify(billData, null, 2));

      // Build the SendBillNotification payload matching backend DTO
      const sendPayload = {
        customerName: billData.billCustomerDetails.customerName,
        billId: billData.billId,
        title: billData.title,
        amount: billData.amount,
        merchantName: billData.billMerchantDetails.merchantName,
        merchantUserName: billData.billMerchantDetails.merchantUserName,
        merchantId: billData.billMerchantDetails.merchantId,
        customerId: billData.billCustomerDetails.customerId,
      };

      onBillCreated?.(billData, sendPayload);

      setForm({
        customerId: "",
        amount: "",
        title: "",
        billLocation: "",
        mode: "",
        status: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" /></svg>
          Create Bill
        </CardTitle>
        <CardDescription>Generate a new bill for a customer</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Customer ID</label>
              <Input
                type="number"
                name="customerId"
                placeholder="e.g. 123"
                min="1"
                value={form.customerId}
                onChange={handleChange}
                required
                className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Amount (&#8377;)</label>
              <Input
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                placeholder="500.00"
                value={form.amount}
                onChange={handleChange}
                required
                className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Title</label>
            <Input
              type="text"
              name="title"
              placeholder="Monthly Subscription / Order Payment"
              value={form.title}
              onChange={handleChange}
              required
              className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Location <span className="text-zinc-500">(optional)</span>
            </label>
            <Input
              type="text"
              name="billLocation"
              placeholder="Jaipur Store / Online Order #45"
              value={form.billLocation}
              onChange={handleChange}
              className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Payment Mode</label>
              <Select value={form.mode} onValueChange={(v) => setForm((p) => ({ ...p, mode: v }))}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-800">
                  <SelectItem value="ONLINE" className="text-zinc-200">Online</SelectItem>
                  <SelectItem value="CASH" className="text-zinc-200">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Payment Status</label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-800">
                  <SelectItem value="PAID" className="text-zinc-200">Paid</SelectItem>
                  <SelectItem value="PENDING" className="text-zinc-200">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating...
              </span>
            ) : "Generate Bill"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {result && (
          <Card className="mt-4 border-green-800/30 bg-linear-to-br from-green-950/40 to-zinc-900/80">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-sm font-semibold text-green-400">Bill Generated Successfully!</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Bill Title</p>
                    <p className="mt-0.5 font-medium text-white">{result.title}</p>
                  </div>
                  <span className="text-xl font-bold text-green-400">&#8377;{parseFloat(result.amount).toFixed(2)}</span>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Bill ID</p>
                  <p className="mt-0.5 font-mono font-semibold text-white">{result.billId}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Status</p>
                  <div className="mt-1">
                    <Badge variant="outline" className={`gap-1 ${
                      result.status === "PAID" ? "border-green-700/50 text-green-400" : "border-yellow-700/50 text-yellow-400"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {result.status}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Payment Mode</p>
                  <p className="mt-0.5 font-medium text-white">{result.mode}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Location</p>
                  <p className="mt-0.5 text-sm text-zinc-300">{result.billLocation || "—"}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-blue-800/30 bg-blue-950/20 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-blue-400">Merchant</p>
                  <p className="mt-0.5 text-sm font-medium text-white">{result.billMerchantDetails?.merchantName}</p>
                  <p className="text-xs text-zinc-500">@{result.billMerchantDetails?.merchantUserName}</p>
                </div>
                <div className="rounded-lg border border-purple-800/30 bg-purple-950/20 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-purple-400">Customer</p>
                  <p className="mt-0.5 text-sm font-medium text-white">{result.billCustomerDetails?.customerName}</p>
                  <p className="text-xs text-zinc-500">ID: {result.billCustomerDetails?.customerId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
