-- CreateTable
CREATE TABLE "public"."master_taksonomi_risiko" (
    "id" SERIAL NOT NULL,
    "categoryBUMN" TEXT NOT NULL,
    "categoryT2T3KBUMN" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "master_taksonomi_risiko_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_kriteria_risiko" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "master_kriteria_risiko_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "hakAkses" TEXT,

    CONSTRAINT "master_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_unit_kerja" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hierarchyLevel" TEXT,

    CONSTRAINT "master_unit_kerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_strategi_risiko" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nilaiAmbang" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_strategi_risiko_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_sasaran_strategis" (
    "id" SERIAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "sasaran" TEXT NOT NULL,
    "strategi" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "riskValueTimbul" DOUBLE PRECISION,
    "limitRisiko" DOUBLE PRECISION,

    CONSTRAINT "trx_sasaran_strategis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_risiko_identifikasi" (
    "id" SERIAL NOT NULL,
    "sasaranId" INTEGER NOT NULL,
    "ownerUnitId" INTEGER NOT NULL,
    "kategoriId" INTEGER NOT NULL,
    "riskNumber" TEXT NOT NULL,
    "namaRisiko" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trx_risiko_identifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_risiko_inheren" (
    "id" SERIAL NOT NULL,
    "riskId" INTEGER NOT NULL,
    "inherenDampakValue" DOUBLE PRECISION NOT NULL,
    "inherenDampakScale" INTEGER NOT NULL,
    "inherenProbValue" DOUBLE PRECISION NOT NULL,
    "inherenProbScale" INTEGER NOT NULL,
    "inherenExposure" DOUBLE PRECISION NOT NULL,
    "inherenLevel" TEXT NOT NULL,
    "penjelasanDampakKualitatif" TEXT,

    CONSTRAINT "trx_risiko_inheren_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_risiko_residual" (
    "id" SERIAL NOT NULL,
    "riskId" INTEGER NOT NULL,
    "residualDampakValue" DOUBLE PRECISION NOT NULL,
    "residualDampakScale" INTEGER NOT NULL,
    "residualProbValue" DOUBLE PRECISION NOT NULL,
    "residualProbScale" INTEGER NOT NULL,
    "residualExposure" DOUBLE PRECISION NOT NULL,
    "residualLevel" TEXT NOT NULL,
    "targetResidual" TEXT,

    CONSTRAINT "trx_risiko_residual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_kri" (
    "id" SERIAL NOT NULL,
    "riskId" INTEGER NOT NULL,
    "indicatorName" TEXT NOT NULL,
    "unitSatuan" TEXT NOT NULL,
    "thresholdCategory" TEXT,
    "thresholdValue" DOUBLE PRECISION,

    CONSTRAINT "trx_kri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_kontrol_existing" (
    "id" SERIAL NOT NULL,
    "riskId" INTEGER NOT NULL,
    "controlType" TEXT,
    "deskripsiDampak" TEXT,
    "effectivenessRating" TEXT,

    CONSTRAINT "trx_kontrol_existing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_rencana_perlakuan_risiko" (
    "id" SERIAL NOT NULL,
    "riskId" INTEGER NOT NULL,
    "picId" INTEGER NOT NULL,
    "treatmentOption" TEXT,
    "treatmentPlan" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "costRupiah" DOUBLE PRECISION,
    "timelineMonths" INTEGER,
    "rkapProgramType" TEXT,

    CONSTRAINT "trx_rencana_perlakuan_risiko_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_realisasi_risiko_residual" (
    "id" SERIAL NOT NULL,
    "riskId" INTEGER NOT NULL,
    "periode" TIMESTAMP(3) NOT NULL,
    "realisasiDampakValue" DOUBLE PRECISION NOT NULL,
    "realisasiDampakScale" INTEGER NOT NULL,
    "realisasiProbValue" DOUBLE PRECISION NOT NULL,
    "realisasiProbScale" INTEGER NOT NULL,
    "realisasiExposure" DOUBLE PRECISION NOT NULL,
    "realisasiLevel" TEXT NOT NULL,
    "efektivitasPerlakuan" TEXT,

    CONSTRAINT "trx_realisasi_risiko_residual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_realisasi_perlakuan" (
    "id" SERIAL NOT NULL,
    "perlakuanId" INTEGER NOT NULL,
    "periode" TIMESTAMP(3) NOT NULL,
    "realisasiKRI" DOUBLE PRECISION,
    "realisasiRencana" TEXT,
    "realisasiOutput" TEXT,
    "realisasiBiaya" DOUBLE PRECISION,
    "persentaseSerapan" DOUBLE PRECISION,
    "status" TEXT,
    "progress" TEXT,

    CONSTRAINT "trx_realisasi_perlakuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_kejadian_kerugian" (
    "id" SERIAL NOT NULL,
    "tanggalKejadian" TIMESTAMP(3) NOT NULL,
    "namaKejadian" TEXT NOT NULL,
    "kategoriRisikoBUMN" TEXT,
    "penyebabKejadian" TEXT,
    "deskripsi" TEXT,
    "nilaiKerugian" DOUBLE PRECISION,
    "kejadianBerulang" BOOLEAN,
    "mitigasiDirencanakan" TEXT,
    "realisasiMitigasi" TEXT,
    "perbaikanMendatang" TEXT,
    "statusAsuransi" TEXT,
    "nilaiPremi" DOUBLE PRECISION,
    "nilaiKlaim" DOUBLE PRECISION,

    CONSTRAINT "trx_kejadian_kerugian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_internal_control_testing" (
    "id" SERIAL NOT NULL,
    "testingDate" TIMESTAMP(3) NOT NULL,
    "picId" INTEGER NOT NULL,
    "sasaranBUMN" TEXT,
    "riskEvent" TEXT,
    "keyControl" TEXT,
    "metodePengujian" TEXT,
    "kelemahanKontrol" TEXT,
    "rencanaTindakLanjut" TEXT,
    "dueDate" TIMESTAMP(3),
    "statusTindakLanjut" TEXT,

    CONSTRAINT "trx_internal_control_testing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trx_stress_testing" (
    "id" SERIAL NOT NULL,
    "periode" TEXT NOT NULL,
    "skenario" TEXT NOT NULL,
    "pertumbuhanEkonomi" DOUBLE PRECISION,
    "inflasi" DOUBLE PRECISION,
    "sukuBunga" DOUBLE PRECISION,
    "nilaiTukarRupiah" DOUBLE PRECISION,
    "prognosaExposure" DOUBLE PRECISION,

    CONSTRAINT "trx_stress_testing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sys_document_status" (
    "id" SERIAL NOT NULL,
    "documentType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_document_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sys_approval_log" (
    "id" SERIAL NOT NULL,
    "documentStatusId" INTEGER NOT NULL,
    "approverRole" TEXT NOT NULL,
    "approvalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "sys_approval_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sys_audit_trail" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" INTEGER,
    "oldValue" TEXT,
    "newValue" TEXT,

    CONSTRAINT "sys_audit_trail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_user_username_key" ON "public"."master_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "master_user_email_key" ON "public"."master_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "master_unit_kerja_code_key" ON "public"."master_unit_kerja"("code");

-- CreateIndex
CREATE UNIQUE INDEX "trx_risiko_identifikasi_riskNumber_key" ON "public"."trx_risiko_identifikasi"("riskNumber");

-- CreateIndex
CREATE UNIQUE INDEX "trx_risiko_inheren_riskId_key" ON "public"."trx_risiko_inheren"("riskId");

-- CreateIndex
CREATE UNIQUE INDEX "trx_risiko_residual_riskId_key" ON "public"."trx_risiko_residual"("riskId");

-- AddForeignKey
ALTER TABLE "public"."master_user" ADD CONSTRAINT "master_user_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."master_unit_kerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_sasaran_strategis" ADD CONSTRAINT "trx_sasaran_strategis_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."master_unit_kerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_risiko_identifikasi" ADD CONSTRAINT "trx_risiko_identifikasi_sasaranId_fkey" FOREIGN KEY ("sasaranId") REFERENCES "public"."trx_sasaran_strategis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_risiko_identifikasi" ADD CONSTRAINT "trx_risiko_identifikasi_ownerUnitId_fkey" FOREIGN KEY ("ownerUnitId") REFERENCES "public"."master_unit_kerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_risiko_identifikasi" ADD CONSTRAINT "trx_risiko_identifikasi_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "public"."master_taksonomi_risiko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_risiko_inheren" ADD CONSTRAINT "trx_risiko_inheren_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."trx_risiko_identifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_risiko_residual" ADD CONSTRAINT "trx_risiko_residual_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."trx_risiko_identifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_kri" ADD CONSTRAINT "trx_kri_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."trx_risiko_identifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_kontrol_existing" ADD CONSTRAINT "trx_kontrol_existing_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."trx_risiko_identifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_rencana_perlakuan_risiko" ADD CONSTRAINT "trx_rencana_perlakuan_risiko_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."trx_risiko_identifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_rencana_perlakuan_risiko" ADD CONSTRAINT "trx_rencana_perlakuan_risiko_picId_fkey" FOREIGN KEY ("picId") REFERENCES "public"."master_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_realisasi_risiko_residual" ADD CONSTRAINT "trx_realisasi_risiko_residual_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."trx_risiko_identifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_realisasi_perlakuan" ADD CONSTRAINT "trx_realisasi_perlakuan_perlakuanId_fkey" FOREIGN KEY ("perlakuanId") REFERENCES "public"."trx_rencana_perlakuan_risiko"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trx_internal_control_testing" ADD CONSTRAINT "trx_internal_control_testing_picId_fkey" FOREIGN KEY ("picId") REFERENCES "public"."master_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sys_approval_log" ADD CONSTRAINT "sys_approval_log_documentStatusId_fkey" FOREIGN KEY ("documentStatusId") REFERENCES "public"."sys_document_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sys_audit_trail" ADD CONSTRAINT "sys_audit_trail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."master_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
