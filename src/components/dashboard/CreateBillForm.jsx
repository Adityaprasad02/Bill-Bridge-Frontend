import { useState } from "react";
import { createBill } from "@/api/billService";

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
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h3 className="mb-3 text-base font-semibold text-white">
        Create Bill for Customer
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Customer ID</label>
          <input
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            type="number"
            name="customerId"
            placeholder="e.g. 123"
            min="1"
            value={form.customerId}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Amount (₹)</label>
          <input
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            placeholder="500.00"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Title</label>
          <input
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            type="text"
            name="title"
            placeholder="Monthly Subscription / Order Payment"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">
            Bill Location (optional)
          </label>
          <input
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            type="text"
            name="billLocation"
            placeholder="Jaipur Store / Online Order #45"
            value={form.billLocation}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Payment Mode</label>
          <select
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            name="mode"
            value={form.mode}
            onChange={handleChange}
            required
          >
            <option value="">Select Mode</option>
            <option value="ONLINE">ONLINE</option>
            <option value="CASH">CASH</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">
            Payment Status
          </label>
          <select
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <option value="">Select Status</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate Bill"}
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded bg-red-900/40 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-3 rounded bg-green-900/40 px-3 py-2 text-sm text-green-300">
          Bill Generated Successfully!
          <pre className="mt-1 text-xs text-zinc-400 overflow-auto max-h-48">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
