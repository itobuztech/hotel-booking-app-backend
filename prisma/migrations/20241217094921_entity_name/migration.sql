/*
  Warnings:

  - You are about to drop the column `file` on the `entity` table. All the data in the column will be lost.
  - Added the required column `name` to the `entity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "entity" DROP COLUMN "file",
ADD COLUMN     "name" VARCHAR(500) NOT NULL;
