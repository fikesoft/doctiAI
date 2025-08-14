import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="text-center">
        <h1 className="text-h1 font-bold mb-4">404 – Page Not Found</h1>
        <p className="mb-6">
          Sorry, we couldn’t find what you were looking for.
        </p>
        <Link href="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
