-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'IT', 'DE');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "provider" TEXT,
    "providerId" TEXT,
    "refreshToken" TEXT,
    "lastIp" TEXT,
    "language" "Language" DEFAULT 'IT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserTenant" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_name_key" ON "Tenant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_url_key" ON "Tenant"("url");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_UserTenant_AB_unique" ON "_UserTenant"("A", "B");

-- CreateIndex
CREATE INDEX "_UserTenant_B_index" ON "_UserTenant"("B");

-- AddForeignKey
ALTER TABLE "_UserTenant" ADD CONSTRAINT "_UserTenant_A_fkey" FOREIGN KEY ("A") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTenant" ADD CONSTRAINT "_UserTenant_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
