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



-- CreateIndex
CREATE UNIQUE INDEX "Tenant_name_key" ON "Tenant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_url_key" ON "Tenant"("url");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

