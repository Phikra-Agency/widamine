-- CreateTable
CREATE TABLE "PractitionerUnavailability" (
    "id" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "excuseType" TEXT NOT NULL,
    "customReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PractitionerUnavailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PractitionerUnavailability_practitionerId_idx" ON "PractitionerUnavailability"("practitionerId");

-- CreateIndex
CREATE INDEX "PractitionerUnavailability_status_idx" ON "PractitionerUnavailability"("status");

-- CreateIndex
CREATE INDEX "PractitionerUnavailability_startDate_endDate_idx" ON "PractitionerUnavailability"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "PractitionerUnavailability" ADD CONSTRAINT "PractitionerUnavailability_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
