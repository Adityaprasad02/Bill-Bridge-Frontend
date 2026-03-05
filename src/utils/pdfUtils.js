export const validatePdf = (file) => {
  if (!file) return false;

  if (file.type !== "application/pdf") {
    alert("Only PDF allowed");
    return false;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Max size 5MB");
    return false;
  }

  return true;
};

export const uploadPdf = async (file) => {
    var url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${url}/upload/pdf`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Upload failed");

  return res.json();
};