# Phase 2A: Reporting & Analytics Architecture Plan

## 📊 **ANALYTICS ARCHITECTURE OVERVIEW**

### **Current Database Analysis ✅**
The existing schema provides excellent foundation for analytics:
- ✅ **Risk Data**: Complete risk lifecycle (inherent → residual → realization)
- ✅ **KRI Tracking**: Key Risk Indicators with thresholds
- ✅ **Treatment Monitoring**: Treatment plans with realization tracking
- ✅ **Loss Events**: Historical loss data for trend analysis
- ✅ **Audit Trail**: Complete activity logging for compliance

### **Analytics Data Models to Add**

#### 1. **Risk Metrics & Aggregations**
```sql
-- Aggregated risk metrics for faster reporting
model RiskMetrics {
  id              Int      @id @default(autoincrement())
  riskId          Int
  periode         DateTime // Monthly aggregation
  unitId          Int
  kategoriId      Int
  
  -- Computed Metrics
  inherentScore   Float
  residualScore   Float
  treatmentCount  Int
  kriCount        Int
  overdueTreatments Int
  
  -- Trend Indicators
  scoreChange     Float    // vs previous period
  trendDirection  String   // UP, DOWN, STABLE
  
  -- Performance Metrics
  treatmentEffectiveness Float
  kriPerformance  Float
  
  createdAt       DateTime @default(now())
  
  @@unique([riskId, periode])
  @@map("analytics_risk_metrics")
}
```

#### 2. **Dashboard Analytics Views**
```sql
-- Pre-computed dashboard data
model DashboardAnalytics {
  id                    Int      @id @default(autoincrement())
  periode               DateTime
  unitId                Int?     // NULL for organization-wide
  
  -- Risk Overview
  totalRisks            Int
  highRisks             Int
  criticalKRIs          Int
  overdueTreatments     Int
  
  -- Trend Analysis
  riskTrend             String   // UP, DOWN, STABLE
  treatmentProgress     Float    // Percentage
  complianceScore       Float
  
  -- Heat Map Data
  heatMapData           String   // JSON for risk matrix
  
  lastUpdated           DateTime @default(now())
  
  @@unique([periode, unitId])
  @@map("analytics_dashboard")
}
```

#### 3. **Report Generation History**
```sql
-- Track generated reports
model ReportHistory {
  id            Int      @id @default(autoincrement())
  templateId    Int?
  generatedBy   String   // User ID
  reportType    String
  parameters    String   // JSON filters & settings
  filePath      String?  // PDF file location
  status        String   // GENERATING, COMPLETED, FAILED
  createdAt     DateTime @default(now())
  completedAt   DateTime?
  
  @@map("analytics_report_history")
}
```

## 🎯 **IMPLEMENTATION ROADMAP**

### **Phase 2A.1: Analytics Infrastructure (Week 1)**
1. ✅ Database schema updates
2. ✅ Analytics data pipeline
3. ✅ Charting library integration (Chart.js/Recharts)
4. ✅ API endpoints for analytics data

### **Phase 2A.2: Advanced Dashboard (Week 1-2)**
1. ✅ Risk trend analysis charts
2. ✅ KRI performance tracking
3. ✅ Interactive heat maps
4. ✅ Drill-down capabilities

### **Phase 2A.3: Report Generation (Week 2)**
1. ✅ PDF report generation
2. ✅ Email notifications
3. ✅ Scheduled reports
4. ✅ Custom report builder

### **Phase 2A.4: Advanced Analytics (Week 2-3)**
1. ✅ Predictive modeling
2. ✅ Benchmark analysis
3. ✅ Compliance scoring
4. ✅ Performance indicators

## 📋 **TECHNICAL STACK**

### **Charting & Visualization**
- **Primary**: Recharts (React-native charts)
- **Alternative**: Chart.js with react-chartjs-2
- **Maps**: React-vis for heat maps
- **Exports**: html-to-pdf for report generation

### **Analytics Processing**
- **Data Aggregation**: Prisma aggregations + background jobs
- **Caching**: Redis for performance (optional)
- **Calculations**: Server-side processing in API routes

### **Report Generation**
- **PDF**: Puppeteer + React components
- **Email**: Nodemailer integration
- **Scheduling**: Node-cron for automated reports

## 🚀 **IMPLEMENTATION PRIORITY**

### **High Priority (Immediate Impact)**
1. ✅ Risk trend dashboard
2. ✅ KRI performance tracking
3. ✅ Treatment effectiveness monitoring
4. ✅ Compliance score visualization

### **Medium Priority (Business Value)**
1. ✅ PDF report generation
2. ✅ Custom report builder
3. ✅ Email notifications
4. ✅ Historical trend analysis

### **Advanced Features (Future Enhancement)**
1. ✅ Predictive risk modeling
2. ✅ Machine learning insights
3. ✅ Advanced benchmark analysis
4. ✅ Real-time alerting system

---

**Next Step**: Start implementing analytics infrastructure and enhanced dashboard components.