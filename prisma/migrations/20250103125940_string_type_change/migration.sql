/*
  Warnings:

  - You are about to alter the column `source` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `city` on the `branch` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `location` on the `branch` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `name` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `roomName` on the `room` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `roomType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `room_initial` on the `roomType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `file` on the `upload` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - Changed the type of `offer_price` on the `branchRoomTypeRelation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `set_price` on the `branchRoomTypeRelation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "booking" ALTER COLUMN "source" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "branch" ALTER COLUMN "city" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "location" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "branchRoomTypeRelation" DROP COLUMN "offer_price",
ADD COLUMN     "offer_price" DECIMAL(65,30) NOT NULL,
DROP COLUMN "set_price",
ADD COLUMN     "set_price" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "name" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "room" ALTER COLUMN "roomName" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "roomType" ALTER COLUMN "name" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "room_initial" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "upload" ALTER COLUMN "file" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(500);
