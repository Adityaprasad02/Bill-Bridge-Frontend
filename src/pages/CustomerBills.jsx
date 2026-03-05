import React, { useState } from "react";

export default function CustomerBill({ bill, index, onPay, paying }) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 mb-3">
      <div className="font-semibold text-white">
        💸 Bill from {bill.merchantName}
      </div>
      <div className="text-sm text-zinc-400">Bill ID: {bill.billId}</div>
      <div className="mt-2 text-white">Amount: ₹{parseFloat(bill.amount).toFixed(2)}</div>
      <div className="text-zinc-300">Title: {bill.title}</div>
      <div className="text-sm text-zinc-400">Customer: {bill.customerName}</div>
      <div className="mt-3">
        <button
          className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          disabled={paying}
          onClick={() => onPay(bill, index)}
        >
          {paying ? "Processing…" : `Pay ₹${parseFloat(bill.amount).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}