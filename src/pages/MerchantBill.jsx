import React from "react";

export default function MerchantBill({ bill }) {

  return (
    <div style={{border:"1px solid blue",padding:"10px",margin:"10px"}}>

      <h3>Merchant Bill #{bill.billId}</h3>

      <p>Customer : {bill.customer}</p>

      <p>Amount : ₹{bill.amount}</p>

      <p>Status : {bill.status}</p>

    </div>
  );
}