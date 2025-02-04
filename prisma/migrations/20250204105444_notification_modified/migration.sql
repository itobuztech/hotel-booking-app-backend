/*
  Warnings:

  - Added the required column `user_type` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "status" BOOLEAN DEFAULT false,
ADD COLUMN     "user_type" "UserRole" NOT NULL;
