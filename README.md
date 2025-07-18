# Next.js + NextAuth App Router Project

This repository is a Next.js application using the App Router, Prisma adapter for NextAuth, and a custom middleware/rewrites setup to handle trailing‑slash issues on NextAuth API routes.

---

## Features

- **Next.js App Router** for all pages and API endpoints
- **NextAuth** with GitHub Provider and Prisma Adapter
- **Custom README** documenting:

  - Environment setup
  - `next.config.js` tweaks
  - Middleware for rewrite/redirect of trailing slashes
  - NextAuth handler in `app/api/auth/[...nextauth]/route.ts`

- **Prisma** for session and user storage
- **Automatic trailing‑slash handling** to avoid 308 loops

---

## Prerequisites

- Node.js v16+ or newer
- npm, yarn, or pnpm
- A GitHub OAuth app (Client ID & Secret)
- A database supported by Prisma (e.g., PostgreSQL)

---

## Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd <your-project-folder>
   ```

2. Install dependencies:

   ```bash
   npm install
   # or `yarn` / `pnpm install`
   ```

3. Set up your database and run Prisma migrations:

   ```bash
   npx prisma migrate dev
   ```

---

## Environment Variables

Create a `.env` file in the project root with the following:

```ini
# Application URL (no trailing slash)
NEXTAUTH_URL=http://localhost:3000

# A long, random string (keep this consistent across restarts!)
NEXTAUTH_SECRET=<your-secret>

# GitHub OAuth credentials
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>

# Database URL for Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

---

## Configuration

### `next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep routes slash‑less
  trailingSlash: false,

  // Prevent Next.js’s built‑in slash redirects
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      {
        // Internally rewrite any /api/auth/<...>/ URL to slash‑less
        source: "/api/auth/:path*/",
        destination: "/api/auth/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
```

### Middleware (optional)

If you prefer middleware over rewrites, place `middleware.ts` at the project root:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname.startsWith("/api/auth/") && url.pathname.endsWith("/")) {
    const clean = url.pathname.slice(0, -1);
    return NextResponse.rewrite(new URL(clean + url.search, request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/auth/:path*"] };
```

---

## NextAuth Handler

Located at `app/api/auth/[...nextauth]/route.ts`:

```ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      /* your config */
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    /* jwt & session callbacks */
  },
  pages: { error: "/auth/error" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export async function GET(req: NextRequest) {
  // Optional: strip trailing slash on GET
  const url = req.nextUrl;
  if (url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url);
  }
  return handler(req);
}
export { handler as POST };
```

---

## Running the App

```bash
# Clear build cache
rm -rf .next

# Start the dev server\ npm run dev
```

- Open `http://localhost:3000` in your browser.
- Use the NextAuth hooks (`useSession()`, `signIn()`, etc.) in your React components.
- All API routes under `/api/auth` will be rewritten or handled without trailing‑slash issues.

---

## Troubleshooting

- **Empty `{}` on `/api/auth/session`**

  1. Clear cookies in your browser (`__Secure-next-auth.session-token`).
  2. Ensure `NEXTAUTH_SECRET` is set and unchanged.
  3. Confirm `.env` has no trailing slashes in URLs.

- **Error: Too many redirects**

  - Remove custom redirects and rely on rewrites + `skipTrailingSlashRedirect`.

- **Middleware not firing**

  - Ensure `middleware.ts` is at the repo root (or `src/` if using that convention).
  - Verify your Next.js version is ≥ 13.
  - Stop the server, delete `.next/`, and restart.

---

## License

This project is licensed under the MIT License.
