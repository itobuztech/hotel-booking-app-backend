/*
  Warnings:

  - You are about to drop the column `finalPrice` on the `booking` table. All the data in the column will be lost.
  - You are about to alter the column `offer_price` on the `branchRoomTypeRelation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `set_price` on the `branchRoomTypeRelation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Added the required column `final_price` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking" DROP COLUMN "finalPrice",
ADD COLUMN     "final_price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "branchRoomTypeRelation" ALTER COLUMN "offer_price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "set_price" SET DATA TYPE DECIMAL(10,2);
