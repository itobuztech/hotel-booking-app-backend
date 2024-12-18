import * as bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrivilegesList } from "../src/privileges/user-privileges";
const prisma = new PrismaClient();

async function main() {
  //CREATE UserRoles
  await prisma.role.createMany({
    data: [
      {
        name: "Owner",
        description: "Owner of the hotel.",
        userType: UserRole.ADMIN,
        privileges: [
          101, 102, 201, 202, 203, 204, 301, 302, 303, 304, 401, 402, 403, 404,
        ],
      },
      {
        name: "Customer",
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
      },
      {
        email: "sudeep@itobuz.com",
        name: "Owner Two",
        password: password,
        roleId: adminRole.id,
      },
    ],
  });

  await prisma.entity.createMany({
    data: [
      {
        name: "Amenities",
      },
      {
        name: "Room Type",
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
