-- CreateTable
CREATE TABLE "public"."Processed_images" (
    "id" TEXT NOT NULL,
    "image_processing_id" TEXT NOT NULL,
    "processed_file_path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Processed_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Processed_images_image_processing_id_key" ON "public"."Processed_images"("image_processing_id");
