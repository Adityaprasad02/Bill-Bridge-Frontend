import { useState } from "react";
import { registerMerchant } from "@/api/billService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Card className="border-amber-800/30 bg-linear-to-br from-amber-950/30 to-zinc-900/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          Merchant Registration
        </CardTitle>
        <CardDescription className="text-amber-300/70">
          You are not registered as a merchant yet. Complete the form below to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Business Name</label>
              <Input
                name="businessName"
                placeholder="Your business name"
                value={form.businessName}
                onChange={handleChange}
                required
                className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Merchant Type</label>
              <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-800">
                  <SelectItem value="ONLINE" className="text-zinc-200">Online</SelectItem>
                  <SelectItem value="OFFLINE" className="text-zinc-200">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Address</label>
            <Input
              name="address"
              placeholder="Full business address"
              value={form.address}
              onChange={handleChange}
              required
              className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">GST Number</label>
            <Input
              name="gstNumber"
              placeholder="e.g. AAACM3025E1ZZ"
              value={form.gstNumber}
              onChange={handleChange}
              required
              className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Registering...
              </span>
            ) : "Register as Merchant"}
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
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-sm font-semibold text-green-400">Registered Successfully!</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result).map(([key, value]) => (
                  <div key={key} className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{key}</p>
                    <p className="mt-0.5 text-sm text-zinc-200">{typeof value === "object" ? JSON.stringify(value) : String(value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
