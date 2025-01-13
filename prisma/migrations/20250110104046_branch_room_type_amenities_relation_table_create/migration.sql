-- CreateTable
CREATE TABLE "branchRoomTypeAmenitiesRelation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amenities_id" UUID,
    "branch_room_type_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "branchRoomTypeAmenitiesRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "branchRoomTypeAmenitiesRelation" ADD CONSTRAINT "branchRoomTypeAmenitiesRelation_amenities_id_fkey" FOREIGN KEY ("amenities_id") REFERENCES "amenities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branchRoomTypeAmenitiesRelation" ADD CONSTRAINT "branchRoomTypeAmenitiesRelation_branch_room_type_id_fkey" FOREIGN KEY ("branch_room_type_id") REFERENCES "branchRoomTypeRelation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
