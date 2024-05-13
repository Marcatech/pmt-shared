/*
  Warnings:

  - You are about to drop the `_UserTenant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserTenant" DROP CONSTRAINT "_UserTenant_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserTenant" DROP CONSTRAINT "_UserTenant_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastTenantId" INTEGER;

-- DropTable
DROP TABLE "_UserTenant";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lastTenantId_fkey" FOREIGN KEY ("lastTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
