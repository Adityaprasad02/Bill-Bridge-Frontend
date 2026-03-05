import { useState, useRef } from "react";
import { uploadBillPdf } from "@/api/billService";

export default function UploadBillPdf({ onUploaded }) {
  const [billId, setBillId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "ok"|"err", text }
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
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h4 className="mb-3 text-sm font-semibold text-zinc-200">
        📄 Upload Bill PDF
      </h4>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-1/3">
          <label className="mb-1 block text-xs text-zinc-400">Bill ID</label>
          <input
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            type="number"
            min="1"
            placeholder="e.g. 1201"
            value={billId}
            onChange={(e) => setBillId(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-zinc-400">Bill PDF</label>
          <input
            ref={fileRef}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:text-white"
            type="file"
            accept="application/pdf"
            required
          />
          <p className="mt-1 text-xs text-zinc-500">Only PDF files accepted.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading…" : "Upload Bill"}
        </button>
      </form>

      {msg && (
        <div
          className={`mt-3 rounded px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "bg-green-900/40 text-green-300"
              : "bg-red-900/40 text-red-300"
          }`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
