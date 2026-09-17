-- CreateTable
CREATE TABLE "FlagRule" (
    "id" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlagRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlagRule" ADD CONSTRAINT "FlagRule_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "FeatureFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
