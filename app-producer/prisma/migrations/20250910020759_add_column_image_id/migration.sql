/*
  Warnings:

  - Added the required column `image_id` to the `ProcessedImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ProcessedImage" ADD COLUMN     "image_id" TEXT NOT NULL;
