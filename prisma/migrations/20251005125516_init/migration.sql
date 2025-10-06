/*
  Warnings:

  - You are about to drop the column `title` on the `Videos` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."IssuesState" AS ENUM ('Open', 'Closed');

-- AlterTable
ALTER TABLE "public"."Videos" DROP COLUMN "title";

-- CreateTable
CREATE TABLE "public"."Issues" (
    "id" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "state" "public"."IssuesState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Issues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Issues" ADD CONSTRAINT "Issues_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Issues" ADD CONSTRAINT "Issues_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
