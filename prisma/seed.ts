import { UserRole } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const githubId = process.env.ADMIN_GITHUB_ID!; // e.g. "129075840"

  // Upsert the user and—if creating—also create the matching Account row
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.admin },
    create: {
      email: adminEmail,
      name: "Site Admin",
      role: UserRole.admin,
      accounts: {
        create: {
          provider: "github",
          type: "oauth",
          providerAccountId: githubId,
          access_token: "",
          refresh_token: "",
          scope: "read:user repo user:email",
        },
      },
    },
  });

  console.log(`✅ Ensured admin exists and is linked to GitHub ID ${githubId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
