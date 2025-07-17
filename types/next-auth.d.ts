import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: number;
    role: UserRole;
    balance: number;
  }
  interface Session {
    user: {
      id: number;
      role: UserRole;
      balance: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: number;
    role: UserRole;
    balance: number;
  }
}
