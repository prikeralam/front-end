-- CreateEnum
CREATE TYPE "VisibilityTier" AS ENUM ('public', 'on_request', 'internal');

-- CreateEnum
CREATE TYPE "AccessRequestStatus" AS ENUM ('pending', 'approved', 'denied');

-- CreateTable
CREATE TABLE "DatasetVisibilityOverride" (
    "id" TEXT NOT NULL,
    "ckanSlug" TEXT NOT NULL,
    "tier" "VisibilityTier" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatasetVisibilityOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "datasetSlug" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "status" "AccessRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewerEmail" TEXT,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatasetVisibilityOverride_ckanSlug_key" ON "DatasetVisibilityOverride"("ckanSlug");

-- CreateIndex
CREATE INDEX "AccessRequest_datasetSlug_requesterEmail_idx" ON "AccessRequest"("datasetSlug", "requesterEmail");

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_datasetSlug_fkey" FOREIGN KEY ("datasetSlug") REFERENCES "DatasetVisibilityOverride"("ckanSlug") ON DELETE RESTRICT ON UPDATE CASCADE;
