-- AlterTable
ALTER TABLE "FeatureFlag" ADD COLUMN     "rolloutPercentage" INTEGER NOT NULL DEFAULT 100;
