import * as bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrivilegesList } from "../src/privileges/user-privileges";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  //CREATE UserRoles
  await prisma.role.createMany({
    data: [
      {
        name: "Robert Smith",
        description: "Owner of the hotel.",
        userType: UserRole.ADMIN,
        privileges: [
          101, 102, 111, 112, 113, 114, 131, 132, 133, 134, 141, 142, 143, 144,
        ],
      },
      {
        name: "Benjamin Miller",
        description: "Customers of hotel",
        userType: UserRole.CUSTOMER,
        privileges: [101],
      },
    ],
    skipDuplicates: true,
  });

  const adminRole = await prisma.role.findFirst({
    where: {
      userType: UserRole.ADMIN,
    },
  });

  const password = await bcrypt.hash("Itobuz#1234", 10);

  //Create OWNER user
  await prisma.user.createMany({
    data: [
      {
        email: "palash@itobuz.com",
        name: "Owner One",
        password: password,
        roleId: adminRole.id,
        isEmailConfirmed: true,
      },
      {
        email: "sudeep@itobuz.com",
        name: "Owner Two",
        password: password,
        roleId: adminRole.id,
        isEmailConfirmed: true,
      },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
