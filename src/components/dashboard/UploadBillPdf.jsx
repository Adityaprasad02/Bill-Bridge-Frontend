import { useState, useRef } from "react";
import { uploadBillPdf } from "@/api/billService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UploadBillPdf({ onUploaded }) {
  const [billId, setBillId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    const id = billId.trim();
    const file = fileRef.current?.files?.[0];

    if (!id || Number(id) <= 0) {
      setMsg({ type: "err", text: "Please enter a valid Bill ID." });
      return;
    }
    if (!file) {
      setMsg({ type: "err", text: "Please select a PDF file." });
      return;
    }
    if (file.type !== "application/pdf") {
      setMsg({ type: "err", text: "Only PDF files are allowed." });
      return;
    }

    setLoading(true);
    try {
      await uploadBillPdf(id, file);
      setMsg({ type: "ok", text: "Bill uploaded successfully." });
      setBillId("");
      if (fileRef.current) fileRef.current.value = "";
      onUploaded?.();
    } catch (err) {
      setMsg({
        type: "err",
        text:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /><path fillRule="evenodd" d="M8 11a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
          Upload Bill PDF
        </CardTitle>
        <CardDescription>Attach a PDF document to an existing bill</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1.5 sm:w-1/3">
            <label className="text-sm font-medium text-zinc-300">Bill ID</label>
            <Input
              type="number"
              min="1"
              placeholder="e.g. 1201"
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
              required
              className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Bill PDF</label>
            <input
              ref={fileRef}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:font-medium file:text-white file:hover:bg-blue-700"
              type="file"
              accept="application/pdf"
              required
            />
            <p className="text-xs text-zinc-500">Only PDF files accepted</p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                Upload
              </span>
            )}
          </Button>
        </form>

        {msg && (
          <div className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "border-green-800/50 bg-green-950/30 text-green-300"
              : "border-red-800/50 bg-red-950/30 text-red-300"
          }`}>
            {msg.type === "ok" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            )}
            {msg.text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
