-- CreateTable
CREATE TABLE "item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "room_initial" VARCHAR(250),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "png" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_png_key" ON "item"("png");

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_png_fkey" FOREIGN KEY ("png") REFERENCES "upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
