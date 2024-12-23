/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[room_initial]` on the table `item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "item_name_key" ON "item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "item_room_initial_key" ON "item"("room_initial");
