-- DropForeignKey
ALTER TABLE "public"."Branch" DROP CONSTRAINT "Branch_workspace_fkey";

-- AlterTable
ALTER TABLE "public"."Branch" ALTER COLUMN "headVersion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Workspace" ALTER COLUMN "activeBranch" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Branch" ADD CONSTRAINT "Branch_workspace_fkey" FOREIGN KEY ("workspace") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
