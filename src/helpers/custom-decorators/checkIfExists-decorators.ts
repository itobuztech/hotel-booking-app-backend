import {
  ConflictException,
  createParamDecorator,
  ExecutionContext,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { PrismaService } from "src/prisma/prisma.service";

export const checkIfExists = createParamDecorator(
  async (data: any, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const createBranchInputObj = ctx.getArgs().createBranchInput;

    const prisma = new PrismaService();

    const branchNameExists = await prisma.branch.findUnique({
      where: { name: createBranchInputObj.name },
    });

    const contactNumberExists = await prisma.branch.findUnique({
      where: { contactNumber: createBranchInputObj.contactNumber },
    });

    if (branchNameExists || contactNumberExists) {
      let errMsg = branchNameExists
        ? `Name '${createBranchInputObj.name}' already exists!`
        : `Contact number '${createBranchInputObj.contactNumber}' already exists!`;

      throw new ConflictException(errMsg);
    }

    return true;
  }
);
