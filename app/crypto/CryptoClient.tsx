"use client";
import React, { useEffect } from "react";
import { SiSolana } from "react-icons/si";
import { useSession } from "next-auth/react";
import useAppDispatch from "@/store/hooks/useDispatch";
import { useRouter } from "next/navigation";
import { useDeposit } from "../(hooks)/useDepositSolana";
import { useTransaction } from "../(hooks)/useCheckTransaction";
import { getReferenceFromUrl } from "@/lib/url/url";
import { notifyError, notifySuccess } from "@/lib/notify/notify";
import PaymentQRCode from "../(components)/PaymentQrCode/PaymentQrCode";
import AmountDisplay from "../(components)/AmountSolanaDisplay/AmountSolanaDisplay";
import AdminActions from "../(components)/DepositAdminActions/DepositAdminActions";

export default function CryptoClient({
  usd,
  userId,
  idempotencyKey,
}: {
  usd: number;
  userId: number;
  idempotencyKey?: string;
}) {
  const { data, loading, error } = useDeposit(usd, userId, idempotencyKey);
  const { sending, checkTransaction, sendTransaction } = useTransaction();
  const session = useSession();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!data?.solanaPayUrl) return;
    const ref = getReferenceFromUrl(data.solanaPayUrl);
    if (!ref) return;

    const params = new URLSearchParams(window.location.search);
    params.set("reference", ref);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, [data?.solanaPayUrl, router]);

  useEffect(() => {
    if (error) notifyError(dispatch, error);
  }, [error, dispatch]);

  const onCheck = async () => {
    try {
      const res = await checkTransaction(data?.solanaPayUrl, usd);
      console.log("check result", res);
      notifySuccess(dispatch, "Check completed");
    } catch (e) {
      console.error(e);
      notifyError(dispatch, "Transaction check failed");
    }
  };

  const onSend = async () => {
    try {
      await sendTransaction(data?.solanaPayUrl);
      notifySuccess(dispatch, "Transaction sent successfully");
    } catch (e) {
      console.error(e);
      notifyError(dispatch, "Failed to send transaction");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-2rem)]">
      <div className="card mx-auto max-w-xl shadow-lg bg-base-100">
        <div className="card-body space-y-6">
          <h2 className="text-2xl font-bold text-center">Pay with Crypto</h2>

          <div className="flex justify-center min-h-[220px] items-center">
            <PaymentQRCode
              loading={loading}
              solanaPayUrl={data?.solanaPayUrl}
              recipient={data?.recipient}
            />
          </div>

          <AmountDisplay solAmount={data?.sol} usd={usd} />

          <div className="text-center">
            <span className="text-base-content">
              Send only <span className="font-bold">Solana SOL</span> to this
              address,
              <br />
              or you risk losing your assets
            </span>
          </div>

          <div className="flex justify-center">
            <span className="badge badge-outline badge-lg font-bold px-3 gap-2">
              Solana <SiSolana />
            </span>
          </div>

          <AdminActions
            role={session.data?.user.role ?? null}
            onSend={onSend}
            onCheck={onCheck}
            sending={sending}
          />
        </div>
      </div>
    </div>
  );
}
