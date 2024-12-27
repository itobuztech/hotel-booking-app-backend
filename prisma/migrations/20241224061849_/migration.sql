/*
  Warnings:

  - You are about to drop the column `emailConfirmationToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailConfirmed` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "item" ADD COLUMN     "parent_room_id" VARCHAR(250);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailConfirmationToken",
DROP COLUMN "isEmailConfirmed",
ADD COLUMN     "email_confirmation_token" TEXT,
ADD COLUMN     "is_email_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false;
