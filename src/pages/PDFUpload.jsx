import React from "react";
import { validatePdf } from "../utils/pdfUtils.js";

export default function PDFUpload({ onSelect }) {
  const handleChange = (e) => {
    const file = e.target.files[0];

    if (validatePdf(file)) {
      onSelect(file);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleChange} />
    </div>
  );
}