-- AlterTable
ALTER TABLE "public"."sys_report_templates" ADD COLUMN     "createdBy" TEXT;

-- CreateTable
CREATE TABLE "public"."analytics_risk_metrics" (
    "id" SERIAL NOT NULL,
    "riskId" INTEGER NOT NULL,
    "periode" TIMESTAMP(3) NOT NULL,
    "unitId" INTEGER NOT NULL,
    "kategoriId" INTEGER NOT NULL,
    "inherentScore" DOUBLE PRECISION NOT NULL,
    "residualScore" DOUBLE PRECISION NOT NULL,
    "treatmentCount" INTEGER NOT NULL,
    "kriCount" INTEGER NOT NULL,
    "overdueTreatments" INTEGER NOT NULL,
    "scoreChange" DOUBLE PRECISION NOT NULL,
    "trendDirection" TEXT NOT NULL,
    "treatmentEffectiveness" DOUBLE PRECISION NOT NULL,
    "kriPerformance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_risk_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics_dashboard" (
    "id" SERIAL NOT NULL,
    "periode" TIMESTAMP(3) NOT NULL,
    "unitId" INTEGER,
    "totalRisks" INTEGER NOT NULL,
    "highRisks" INTEGER NOT NULL,
    "criticalKRIs" INTEGER NOT NULL,
    "overdueTreatments" INTEGER NOT NULL,
    "riskTrend" TEXT NOT NULL,
    "treatmentProgress" DOUBLE PRECISION NOT NULL,
    "complianceScore" DOUBLE PRECISION NOT NULL,
    "heatMapData" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics_report_history" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER,
    "generatedBy" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "filePath" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "analytics_report_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scheduled_reports" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cronExpression" TEXT NOT NULL,
    "recipientEmails" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_executions" (
    "id" SERIAL NOT NULL,
    "scheduledReportId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "filePath" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "executionTime" INTEGER,

    CONSTRAINT "report_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analytics_risk_metrics_riskId_periode_key" ON "public"."analytics_risk_metrics"("riskId", "periode");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_dashboard_periode_unitId_key" ON "public"."analytics_dashboard"("periode", "unitId");

-- AddForeignKey
ALTER TABLE "public"."analytics_report_history" ADD CONSTRAINT "analytics_report_history_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."sys_report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scheduled_reports" ADD CONSTRAINT "scheduled_reports_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."sys_report_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_executions" ADD CONSTRAINT "report_executions_scheduledReportId_fkey" FOREIGN KEY ("scheduledReportId") REFERENCES "public"."scheduled_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
