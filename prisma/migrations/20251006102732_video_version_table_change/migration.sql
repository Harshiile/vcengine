/*
  Warnings:

  - You are about to drop the `VideoVersions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `version` to the `Videos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."VideoVersions" DROP CONSTRAINT "VideoVersions_version_fkey";

-- DropForeignKey
ALTER TABLE "public"."VideoVersions" DROP CONSTRAINT "VideoVersions_video_fkey";

-- AlterTable
ALTER TABLE "public"."Videos" ADD COLUMN     "version" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."VideoVersions";

-- AddForeignKey
ALTER TABLE "public"."Videos" ADD CONSTRAINT "Videos_version_fkey" FOREIGN KEY ("version") REFERENCES "public"."Versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
