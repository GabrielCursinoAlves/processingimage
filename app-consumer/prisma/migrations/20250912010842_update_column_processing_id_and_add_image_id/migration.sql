/*
  Warnings:

  - You are about to drop the column `image_processing_id` on the `Processed_images` table. All the data in the column will be lost.
  - Added the required column `image_id` to the `Processed_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processing_id` to the `Processed_images` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Processed_images_image_processing_id_key";

-- AlterTable
ALTER TABLE "public"."Processed_images" DROP COLUMN "image_processing_id",
ADD COLUMN     "image_id" TEXT NOT NULL,
ADD COLUMN     "processing_id" TEXT NOT NULL;
