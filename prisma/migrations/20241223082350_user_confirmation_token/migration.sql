-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailConfirmationToken" TEXT,
ADD COLUMN     "isEmailConfirmed" BOOLEAN DEFAULT false;
