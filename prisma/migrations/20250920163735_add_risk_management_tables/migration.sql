-- CreateTable
CREATE TABLE "public"."sys_dashboard_config" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "unitId" INTEGER,
    "widgetType" TEXT NOT NULL,
    "widgetOrder" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "settings" TEXT,

    CONSTRAINT "sys_dashboard_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sys_risk_notifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "riskId" INTEGER,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_risk_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sys_report_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sys_report_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."sys_risk_notifications" ADD CONSTRAINT "sys_risk_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."master_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
