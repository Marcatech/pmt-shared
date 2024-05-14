/*
  Warnings:

  - You are about to drop the `_UserTenant` table. If the table is not empty, all the data it contains will be lost.

*/

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastTenantName" TEXT;
