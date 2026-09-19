-- CreateTable
CREATE TABLE "EnvironmentApiKey" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "environmentId" TEXT NOT NULL,

    CONSTRAINT "EnvironmentApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentApiKey_keyHash_key" ON "EnvironmentApiKey"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentApiKey_environmentId_key" ON "EnvironmentApiKey"("environmentId");

-- AddForeignKey
ALTER TABLE "EnvironmentApiKey" ADD CONSTRAINT "EnvironmentApiKey_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
