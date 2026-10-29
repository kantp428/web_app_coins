type PaymentStatus = { id: string; status: string };

// Missing rows can occur during creation/pagination and do not prove completion.
export function reconcileSellerPaymentQr<T extends PaymentStatus>(
  current: T | null,
  requests: readonly PaymentStatus[],
): T | null {
  if (!current) return null;
  const latest = requests.find((request) => request.id === current.id);
  return latest && latest.status !== "PENDING" ? null : current;
}
