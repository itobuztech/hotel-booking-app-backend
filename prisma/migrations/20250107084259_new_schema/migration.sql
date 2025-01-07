/*
  Warnings:

  - You are about to drop the column `status` on the `amenities` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `bookingStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `bookingStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `branch` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `branchAmenitiesRelation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `branchRoomTypeRelation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `roomType` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `upload` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `uploadRelation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `uploadRelation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contact_number]` on the table `branch` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "amenities" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "bookingStatusHistory" DROP COLUMN "deleted_at",
DROP COLUMN "status",
ADD COLUMN     "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "branch" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "branchAmenitiesRelation" DROP COLUMN "status",
ADD COLUMN     "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "branchRoomTypeRelation" DROP COLUMN "status",
ADD COLUMN     "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "room" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "roomType" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "upload" DROP COLUMN "deleted_at",
DROP COLUMN "status",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "uploadRelation" DROP COLUMN "deleted_at",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status";

-- CreateIndex
CREATE UNIQUE INDEX "branch_contact_number_key" ON "branch"("contact_number");
