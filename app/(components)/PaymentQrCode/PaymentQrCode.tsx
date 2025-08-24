"use client";
import QRCode from "react-qr-code";

export default function PaymentQRCode({
  loading,
  solanaPayUrl,
  recipient,
}: {
  loading: boolean;
  solanaPayUrl?: string | null;
  recipient?: string | null;
}) {
  if (loading) {
    return <span className="loading loading-spinner" />;
  }

  if (solanaPayUrl) {
    return <QRCode value={solanaPayUrl} size={200} />;
  }

  if (recipient) {
    return <QRCode value={recipient} size={200} />;
  }

  return <span>No QR code</span>;
}
