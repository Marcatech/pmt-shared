/*
  Warnings:

  - You are about to drop the `_UserTenant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserTenant" DROP CONSTRAINT "_UserTenant_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserTenant" DROP CONSTRAINT "_UserTenant_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastTenantName" TEXT;

-- DropTable
DROP TABLE "_UserTenant";
