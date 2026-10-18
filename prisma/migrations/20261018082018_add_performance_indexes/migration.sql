-- CreateIndex
CREATE INDEX "Assessment_deadline_idx" ON "Assessment"("deadline");

-- CreateIndex
CREATE INDEX "Assessment_createdAt_idx" ON "Assessment"("createdAt");

-- CreateIndex
CREATE INDEX "AssessmentResult_isPublished_idx" ON "AssessmentResult"("isPublished");

-- CreateIndex
CREATE INDEX "Module_programmeId_idx" ON "Module"("programmeId");

-- CreateIndex
CREATE INDEX "Submission_studentId_idx" ON "Submission"("studentId");

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");
