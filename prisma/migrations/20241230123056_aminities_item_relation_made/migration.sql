/*
  Warnings:

  - You are about to drop the column `entity_id` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `table_id` on the `uploadRelation` table. All the data in the column will be lost.
  - You are about to drop the `entity` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `entity` to the `item` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `table` on the `uploadRelation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('AMENITIES', 'ROOMTYPE');

-- CreateEnum
CREATE TYPE "UploadTableName" AS ENUM ('ITEM', 'BRANCH', 'ROOM');

-- CreateEnum
CREATE TYPE "AminitiesTableName" AS ENUM ('BRANCH', 'ROOM');

-- DropForeignKey
ALTER TABLE "item" DROP CONSTRAINT "item_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "uploadRelation" DROP CONSTRAINT "uploadRelation_table_id_fkey";

-- AlterTable
ALTER TABLE "item" DROP COLUMN "entity_id",
ADD COLUMN     "entity" "Entity" NOT NULL;

-- AlterTable
ALTER TABLE "uploadRelation" DROP COLUMN "table_id",
ADD COLUMN     "branch_id" UUID,
ADD COLUMN     "item_id" UUID,
ADD COLUMN     "room_id" UUID,
DROP COLUMN "table",
ADD COLUMN     "table" "UploadTableName" NOT NULL;

-- DropTable
DROP TABLE "entity";

-- DropEnum
DROP TYPE "TableName";

-- CreateTable
CREATE TABLE "branch" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(500) NOT NULL,
    "address" TEXT NOT NULL,
    "contact_number" BIGINT NOT NULL,
    "city" VARCHAR(500) NOT NULL,
    "area_pincode" BIGINT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID,
    "item_id" UUID,
    "room_initial" VARCHAR(500) NOT NULL,
    "set_price" DECIMAL(65,30) NOT NULL,
    "offer_price" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aminitiesRelation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aminities_id" UUID NOT NULL,
    "table" "AminitiesTableName" NOT NULL,
    "branch_id" UUID,
    "room_id" UUID,

    CONSTRAINT "aminitiesRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branch_name_key" ON "branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "room_room_initial_key" ON "room"("room_initial");

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadRelation" ADD CONSTRAINT "uploadRelation_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aminitiesRelation" ADD CONSTRAINT "aminitiesRelation_aminities_id_fkey" FOREIGN KEY ("aminities_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aminitiesRelation" ADD CONSTRAINT "aminitiesRelation_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aminitiesRelation" ADD CONSTRAINT "aminitiesRelation_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
