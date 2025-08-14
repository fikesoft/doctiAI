import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import CryptoClient from "./CryptoClient";

export default async function CryptoPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Await the searchParams promise
  const params = await searchParams;
  const usdParam = params?.usd;

  // Handle case where usd might be an array (though unlikely for our use case)
  const usdString = Array.isArray(usdParam) ? usdParam[0] : usdParam;
  const usd = usdString ? Number(usdString) : null;

  if (!usd || Number.isNaN(usd) || usd <= 0) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Invalid Amount</h1>
        <p>Please specify a valid USD amount</p>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>Please log in to continue</p>
      </div>
    );
  }

  return <CryptoClient usd={usd} userId={Number(session.user.id)} />;
}
