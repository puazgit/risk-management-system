# Risk Management Components

Dokumentasi lengkap untuk komponen-komponen manajemen risiko yang telah dibuat.

## Daftar Komponen

### 1. RisksTable
**File**: `src/components/risks/risks-table.tsx`

Komponen tabel untuk menampilkan daftar risiko dengan fitur:
- Search dan filter
- Pagination
- Sorting berdasarkan kolom
- Action menu (edit, delete, assess)
- Loading states
- Empty states

```tsx
import { RisksTable } from '@/components/risks'

<RisksTable 
  risks={risks}
  isLoading={false}
  onEdit={(id) => router.push(`/risks/${id}/edit`)}
  onDelete={(id) => handleDelete(id)}
  onAssess={(id) => router.push(`/risks/${id}/assessment`)}
/>
```

### 2. RiskMatrix
**File**: `src/components/risks/risk-matrix.tsx`

Komponen matriks risiko 5x5 dengan fitur:
- Grid interaktif dengan warna berdasarkan tingkat risiko
- Hover effects untuk detail risiko
- Statistik jumlah risiko per level
- Responsive design

```tsx
import { RiskMatrix } from '@/components/risks'

<RiskMatrix 
  risks={risks}
  onCellClick={(level) => console.log('Risk level:', level)}
/>
```

### 3. RiskForm
**File**: `src/components/risks/risk-form.tsx`

Form komprehensif untuk CRUD risiko dengan fitur:
- Validasi menggunakan Zod schema
- Multi-step form (identifikasi, penilaian, kontrol)
- Auto-calculation skor risiko
- Dynamic field dependencies

```tsx
import { RiskForm } from '@/components/risks'

<RiskForm 
  initialData={existingRisk}
  onSubmit={handleSubmit}
  isSubmitting={isLoading}
/>
```

### 4. RiskOverviewCards
**File**: `src/components/risks/risk-overview-cards.tsx`

Kartu overview untuk statistik risiko dengan fitur:
- Animated loading states
- Trend indicators
- Progress bars untuk compliance score
- Individual RiskCard untuk reuse

```tsx
import { RiskOverviewCards } from '@/components/risks'

<RiskOverviewCards 
  data={{
    totalRisks: 45,
    highRisks: 8,
    newRisks: 3,
    assessedRisks: 42,
    overdueTreatments: 5,
    riskTrend: 'up',
    complianceScore: 85
  }}
  isLoading={false}
/>
```

### 5. AssessmentForm
**File**: `src/components/risks/assessment-form.tsx`

Form wizard untuk penilaian risiko dengan fitur:
- 4-step assessment process
- Real-time risk score calculation
- Risk level visualization
- Progress indicator

```tsx
import { AssessmentForm } from '@/components/risks'

<AssessmentForm 
  riskId="123"
  initialData={assessmentData}
  onSubmit={handleAssessment}
  isSubmitting={false}
/>
```

### 6. KRIDashboard
**File**: `src/components/risks/kri-dashboard.tsx`

Dashboard untuk Key Risk Indicators dengan fitur:
- Summary cards dengan status
- Individual KRI cards dengan progress bars
- Threshold visualization
- Real-time updates

```tsx
import { KRIDashboard } from '@/components/risks'

<KRIDashboard 
  kriData={kriList}
  isLoading={false}
/>
```

### 7. RiskAnalytics
**File**: `src/components/risks/risk-analytics.tsx`

Komponen analitik dan visualisasi dengan fitur:
- Multiple chart types (bar, donut, trend)
- Interactive filters
- Export functionality
- Key insights section

```tsx
import { RiskAnalytics } from '@/components/risks'

<RiskAnalytics 
  data={{
    riskByCategory: [...],
    riskByLevel: [...],
    riskTrend: [...],
    treatmentStatus: [...]
  }}
  isLoading={false}
/>
```

## UI Components Tambahan

### Komponen UI yang Ditambahkan:
- `RadioGroup` - untuk pilihan radio button
- `Progress` - untuk progress bars
- `Textarea` - untuk input teks panjang
- `Separator` - untuk pemisah konten

## Data Types

### Risk Interface
```typescript
interface Risk {
  id: string
  kodeRisiko: string
  namaRisiko: string
  deskripsi: string
  jenisRisiko: JenisRisiko
  kategoriRisiko: string
  probabilitasInheren: number
  dampakInheren: number
  skorInheren: number
  levelInheren: LevelRisiko
  probabilitasResidual: number
  dampakResidual: number
  skorResidual: number
  levelResidual: LevelRisiko
  statusRisiko: StatusRisiko
  tanggalIdentifikasi: Date
  penanggungJawab: string
  unitKerja: string
}
```

### KRI Interface
```typescript
interface KRIData {
  id: string
  nama: string
  deskripsi: string
  satuan: string
  frekuensiPemantauan: string
  nilaiAktual: number
  targetValue: number
  warningThreshold: number
  criticalThreshold: number
  trend: 'up' | 'down' | 'stable'
  status: 'normal' | 'warning' | 'critical'
  lastUpdated: string
  penanggungJawab: string
  kategoriRisiko: string
}
```

## Best Practices

1. **Error Handling**: Semua komponen memiliki fallback untuk data kosong dan error states
2. **Loading States**: Skeleton loading untuk UX yang lebih baik
3. **Responsive**: Semua komponen responsive untuk mobile dan desktop
4. **Accessibility**: Menggunakan Radix UI primitives untuk accessibility
5. **Type Safety**: Fully typed dengan TypeScript
6. **Performance**: Optimized rendering dengan proper key props

## Penggunaan dalam Pages

Komponen-komponen ini dirancang untuk digunakan dalam halaman-halaman berikut:
- `/risks` - RisksTable, RiskOverviewCards
- `/risks/create` - RiskForm
- `/risks/[id]` - Detail view dengan komponen individual
- `/risks/[id]/edit` - RiskForm dengan data existing
- `/risks/[id]/assessment` - AssessmentForm
- `/dashboard` - RiskOverviewCards, RiskMatrix, KRIDashboard
- `/analytics` - RiskAnalytics

## Dependencies

Pastikan package berikut sudah terinstall:
```bash
npm install @radix-ui/react-radio-group @radix-ui/react-progress @radix-ui/react-separator
```

## Integrasi dengan API

Semua komponen dirancang untuk bekerja dengan API endpoints yang sudah dibuat:
- `GET /api/risks` - untuk data risiko
- `POST /api/risks` - untuk create risiko
- `PUT /api/risks/[id]` - untuk update risiko
- `DELETE /api/risks/[id]` - untuk delete risiko
- `POST /api/risks/[id]/assessment` - untuk assessment
- `GET /api/risks/matrix` - untuk data matrix