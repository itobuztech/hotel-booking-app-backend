/*
  Warnings:

  - The values [AMINITIES] on the enum `UploadTableName` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `amenities_id` on table `amenitiesRelation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UploadTableName_new" AS ENUM ('AMENITIES', 'BRANCH', 'ROOM');
ALTER TABLE "uploadRelation" ALTER COLUMN "table" TYPE "UploadTableName_new" USING ("table"::text::"UploadTableName_new");
ALTER TYPE "UploadTableName" RENAME TO "UploadTableName_old";
ALTER TYPE "UploadTableName_new" RENAME TO "UploadTableName";
DROP TYPE "UploadTableName_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "amenitiesRelation" DROP CONSTRAINT "amenitiesRelation_amenities_id_fkey";

-- AlterTable
ALTER TABLE "amenitiesRelation" ALTER COLUMN "amenities_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "amenitiesRelation" ADD CONSTRAINT "amenitiesRelation_amenities_id_fkey" FOREIGN KEY ("amenities_id") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
