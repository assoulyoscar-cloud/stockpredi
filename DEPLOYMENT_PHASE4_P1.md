# PHASE 4 P1 - F&B Monetization Deployment Guide
**Date**: 2026-09-18  
**Status**: Ready for deployment  
**Build Time Completed**: 6.5 hours

---

## ✅ What's Been Completed

### 1. Backend (Python/Flask)
**File**: `routes/subscriptions.py` (8.2 KB, 200+ lines)
- ✅ Stripe integration for checkout sessions
- ✅ Webhook handler for subscription events
- ✅ Usage tracking and forecast limit enforcement
- ✅ Error handling and logging
- ✅ Authentication middleware (@auth_required decorator)

**Key Functions**:
```python
POST /api/subscriptions/create-session
  - Creates Stripe checkout URL
  - Input: tier ('pro' or 'enterprise')
  - Returns: {"checkout_url": "https://..."}

POST /api/subscriptions/webhook
  - Stripe event handler
  - Processes: customer.subscription.created/updated/deleted
  - Updates user tier and forecast limits

GET /api/subscriptions/tier
  - Returns current tier and usage info
  - Input: None (uses JWT token)
  - Returns: {"tier": "pro", "limit": 10, "used_today": 3, "remaining": 7}
```

### 2. Database (Supabase)
**File**: `schema_phase4_p1.sql` (2.5 KB)
- ✅ Extended users table:
  - `stripe_subscription_tier` (default: 'free')
  - `stripe_subscription_id`
  - `stripe_subscription_status`
  - `forecast_limit_monthly`
- ✅ Created `forecast_usage` table (daily tracking)
- ✅ Created `subscription_logs` table (audit trail)
- ✅ Indexes on user_id + date
- ✅ RLS policies for security

### 3. Frontend (React)
**File**: `src/pages/FoodBeverageLanding.jsx` (12.6 KB, 400+ lines)
- ✅ Hero section with CTA
- ✅ Problem statement (€82,000 annual waste)
- ✅ Live ROI Calculator:
  - Dynamic calculations as user types
  - Shows annual waste and potential savings
  - Displays ROI payback period
- ✅ Pricing table (Free/Pro/Enterprise)
- ✅ Case study section
- ✅ Stripe checkout integration
- ✅ Auth check (redirects to login if needed)

**Route**: `/industries/food-beverage`

### 4. App Integration
**File**: `src/App.jsx` (UPDATED)
- ✅ Import FoodBeverageLanding
- ✅ Route registered at `/industries/food-beverage`

**File**: `app_backend.py` (UPDATED)
- ✅ Import subscriptions_bp
- ✅ Blueprint registered at `/api/subscriptions`

---

## 📋 Deployment Checklist

### Step 1: Apply Database Schema to Supabase (5 minutes)
1. Go to: https://app.supabase.com → Your Project
2. Click "SQL Editor" → "New Query"
3. Copy entire content of `schema_phase4_p1.sql`
4. Paste and execute
5. Verify: Check tables `forecast_usage` and `subscription_logs` created

**Expected Output**:
```
✓ ALTER TABLE users ADD COLUMN ... (completed successfully)
✓ CREATE TABLE forecast_usage (completed successfully)
✓ CREATE TABLE subscription_logs (completed successfully)
✓ CREATE INDEX ... (completed successfully)
✓ ALTER TABLE ... ENABLE ROW LEVEL SECURITY
✓ CREATE POLICY ... (completed successfully)
```

### Step 2: Create Stripe Products (10 minutes)
1. Go to: https://dashboard.stripe.com/products
2. Create two new products:

**Product 1: Pro Tier**
- Name: "StockPredi Pro - F&B"
- Description: "10 forecasts per month"
- Pricing: €29/month (recurring)
- Save Product ID (e.g., `prod_xxx_fob_pro`)

**Product 2: Enterprise Tier**
- Name: "StockPredi Enterprise - F&B"
- Description: "Unlimited forecasts"
- Pricing: €99/month (recurring)
- Save Product ID (e.g., `prod_xxx_fob_enterprise`)

### Step 3: Set Environment Variables (5 minutes)

#### On Vercel (Frontend)
1. Go to: https://vercel.com → StockPredi Project → Settings → Environment Variables
2. Add (if not already present):
   ```
   VITE_API_URL=https://stockpredi-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx (or pk_test_xxx for testing)
   ```

#### On Render (Backend)
1. Go to: https://dashboard.render.com → stockpredi-backend service
2. Go to "Environment" tab
3. Add/Update:
   ```
   STRIPE_SECRET_KEY=sk_live_xxx (or sk_test_xxx for testing)
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   STRIPE_F&B_PRO_PRICE_ID=price_xxx (from Stripe Product 1)
   STRIPE_F&B_ENTERPRISE_PRICE_ID=price_xxx (from Stripe Product 2)
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJxxx...
   JWT_SECRET=your_jwt_secret
   ```

### Step 4: Verify Stripe Webhook (5 minutes)
1. In Stripe Dashboard: Settings → Webhooks
2. Add Endpoint:
   - URL: `https://stockpredi-backend.onrender.com/api/subscriptions/webhook`
   - Events: Select:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Save and copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Step 5: Deploy Code to Vercel & Render (10 minutes)
```bash
cd ~/stockpredi
git add -A
git commit -m "PHASE 4 P1: F&B Monetization - Backend, DB schema, and Landing page"
git push origin main
```

**What happens automatically**:
- Vercel detects push → builds and deploys frontend
- Render detects push → builds and deploys backend
- Both should complete within 5-10 minutes

---

## 🧪 Testing Checklist

### Test 1: Landing Page Load (2 minutes)
- [ ] Navigate to: https://stockpredi.vercel.app/industries/food-beverage
- [ ] Page loads without errors
- [ ] All sections visible: Hero, Problem, ROI Calculator, Pricing, Case Study
- [ ] Mobile responsive (test on phone/tablet)

### Test 2: ROI Calculator (3 minutes)
- [ ] Input daily revenue: €1500
- [ ] Input profit margin: 15%
- [ ] Input current waste: 8%
- [ ] Verify calculations:
  - Annual waste: ~€43,200
  - With 25% reduction: €32,400 savings/year
  - ROI (Pro tier): €32,400 - €348 = €32,052 profit Year 1
- [ ] All fields update in real-time

### Test 3: Checkout Flow - Free to Pro (5 minutes)
**Prerequisite**: Must be logged in
1. Click "Upgrade to Pro" button
2. Should redirect to Stripe checkout
3. Use test card: `4242 4242 4242 4242`
4. Fill test details (any expiry/zip in future)
5. Click "Subscribe"
6. Should redirect to dashboard with success message
7. Verify in database: user.stripe_subscription_tier = 'pro'

### Test 4: Subscription Webhook (3 minutes)
1. After successful checkout, check Stripe Dashboard → Events
2. Should see `customer.subscription.created` event
3. Click it → verify payload includes:
   - `customer.id`
   - `subscription.items.data[0].price.id`
   - `subscription.status`

### Test 5: Forecast Limit Enforcement (5 minutes)
1. As Pro user, make 10 forecast requests via Dashboard
2. On 11th request, should receive:
   ```json
   {
     "error": "Monthly forecast limit reached. Upgrade to Enterprise.",
     "limit": 10,
     "used": 10,
     "reset_date": "2026-10-18"
   }
   ```

### Test 6: Usage Tracking (2 minutes)
1. Make 3 forecasts as Pro user
2. Query: `GET /api/subscriptions/tier`
3. Response should show:
   ```json
   {
     "tier": "pro",
     "status": "active",
     "limit": 10,
     "used_today": 3,
     "remaining": 7,
     "reset_date": "2026-10-18"
   }
   ```

---

## 📊 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Landing page load time | < 2s | TBD (post-deploy) |
| Checkout flow completion | < 30s | TBD (post-deploy) |
| Webhook processing | < 1s | TBD (post-deploy) |
| Forecast limit enforcement | Real-time | TBD (post-deploy) |
| Error handling | Graceful | ✅ (coded) |

---

## 🚨 Troubleshooting

### Issue: "VITE_API_URL is not defined"
**Solution**: Add to Vercel env vars if not present

### Issue: "Stripe API key not found"
**Solution**: Verify `STRIPE_SECRET_KEY` on Render with correct prefix (sk_live_ or sk_test_)

### Issue: "Webhook signature verification failed"
**Solution**: 
1. Copy exact webhook secret from Stripe dashboard
2. Ensure it's set as `STRIPE_WEBHOOK_SECRET` on Render
3. Redeploy Render after setting env var

### Issue: "forecast_usage table doesn't exist"
**Solution**: 
1. Verify schema_phase4_p1.sql was executed in Supabase
2. Check Supabase SQL Editor → Logs for errors
3. Re-run schema if needed

---

## 📈 Next Steps (PHASE 4 P2-P5)

After P1 is fully tested and running:

1. **P2: Retail Sector** (6-7 hours)
   - RetailLanding.jsx component
   - Retail-specific ROI calculator
   - Inventory turnover optimization

2. **P3: DLUO/Expiration Tracking** (4-5 hours)
   - Schema for product expiration dates
   - Alert system for expiring stock
   - FIFO compliance tracking

3. **P4: Multi-Sector Dashboard** (5-6 hours)
   - Sector selection in user dashboard
   - Unified analytics across sectors
   - Custom reports per sector

4. **P5: ROI Calculator Enhancements** (4-5 hours)
   - Advanced waste modeling
   - Payback period calculator
   - Competitive benchmarking

**Total Estimated Time**: 28.5 hours over 4 weeks

---

## 📝 Files Summary

| File | Type | Size | Status |
|------|------|------|--------|
| `routes/subscriptions.py` | Python | 8.2 KB | ✅ Complete |
| `schema_phase4_p1.sql` | SQL | 2.5 KB | ✅ Ready to deploy |
| `src/pages/FoodBeverageLanding.jsx` | React | 12.6 KB | ✅ Complete |
| `src/App.jsx` | React | UPDATED | ✅ Route added |
| `app_backend.py` | Python | UPDATED | ✅ Blueprint registered |

---

**Generated**: 2026-09-18 09:42 UTC  
**Session**: claude-haiku-4-5-20251001
