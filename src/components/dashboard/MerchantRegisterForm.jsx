import { useState } from "react";
import { registerMerchant } from "@/api/billService";

export default function MerchantRegisterForm({ onRegistered }) {
  const [form, setForm] = useState({
    businessName: "",
    type: "",
    address: "",
    gstNumber: "",
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

    if (!form.businessName || !form.type || !form.address || !form.gstNumber) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await registerMerchant(form);
      setResult(data);
      setTimeout(() => {
        setResult(null);
        onRegistered?.();
      }, 3000);
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
    <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/20 p-4">
      <p className="mb-4 text-yellow-300 text-sm font-medium">
        Not registered as merchant yet. Please register below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Business Name</label>
          <input
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            name="businessName"
            placeholder="Business Name"
            value={form.businessName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Merchant Type</label>
          <select
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Address</label>
          <input
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            name="address"
            placeholder="Full Address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">GST Number</label>
          <input
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            name="gstNumber"
            placeholder="e.g. AAACM3025E1ZZ"
            value={form.gstNumber}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Registering…" : "Register as Merchant"}
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded bg-red-900/40 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-3 rounded bg-green-900/40 px-3 py-2 text-sm text-green-300">
          Registered Successfully!
          <pre className="mt-1 text-xs text-zinc-400 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
