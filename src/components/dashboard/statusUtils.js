/** Status badge class utility — shared across dashboard components */
export function getStatusBadgeClasses(status) {
  switch (status) {
    case "PAID":
    case "TXN_SUCCESS":
      return "bg-green-900/40 text-green-300 border-green-700/40";
    case "FAILED":
    case "DECLINED":
    case "TXN_FAILURE":
      return "bg-red-900/40 text-red-300 border-red-700/40";
    case "PENDING":
      return "bg-yellow-900/40 text-yellow-300 border-yellow-700/40";
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
  }
}

export function isReactedStatus(status) {
  return status && status !== "PENDING";
}
