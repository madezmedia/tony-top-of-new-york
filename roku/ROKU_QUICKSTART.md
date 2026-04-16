# Roku Ads & Roku Pay - Quick Reference

## ✅ Files Created

### Roku Components
1. `roku/components/RokuAds.xml` - Roku ads component definition
2. `roku/components/RokuAds.brs` - Ad playback logic (pre-roll, mid-roll, post-roll)
3. `roku/components/RokuPay.xml` - Roku Pay component definition
4. `roku/components/RokuPay.brs` - Purchase handling logic

### Backend Files
5. `api/roku-purchase.ts` - API endpoint for purchase verification
6. `supabase/migrations/20260312_roku_purchases.sql` - Database migration for purchases

### Documentation
7. `docs/ROKU_MONETIZATION.md` - Complete integration guide

---

## ⚠️ Still Required

### 1. Roku Ads Library
**Download:** https://developer.roku.com/en-gb/develop/monetization
**File:** `Roku_Ads.brs`
**Place in:** `roku/components/` folder

### 2. Configure Ad URL
**File:** `roku/components/RokuAds.brs`
**Function:** `getAdUrlForContent()`
**Update:** Replace with your actual Roku IFA ad URL

### 3. Create Channel Store Products
**Go to:** https://developer.roku.com/en-gb/develop/monetization/channel-store
**Create these products:**
- `tony.episode.single` - $1.99
- `tony.season.1` - $9.99
- `tony.all.access` - $19.99

### 4. Run Database Migration
**File:** `supabase/migrations/20260312_roku_purchases.sql`
**Run in:** Supabase Dashboard → SQL Editor

### 5. Deploy API Endpoint
**File:** `api/roku-purchase.ts`
**Deploy:** Push to Vercel/GitHub

---

## 🔗 Integration Points

### In Your Home Scene (`HomeScene.brs`)

```brightscript
sub init()
  ' Initialize Roku Ads
  m.ropkuAds = m.top.findNode("rokuAds")
  m.ropkuAds.control = "run"

  ' Initialize Roku Pay
  m.rokuPay = m.top.findNode("rokuPay")
  m.rokuPay.control = "run"
end sub
```

### In Your Content Player (`VideoPlayer.brs`)

```brightscript
sub playContent(content as Object)
  if NOT m.global.user.isPremium then
    ' Show ad first
    m.ropkuAds.showPreroll(content)
    ' Wait for ad to complete, then play
  else
    ' Premium user, no ads
    playVideo(content)
  end if
end sub
```

### In Your Purchase Dialog

```brightscript
sub onPurchaseSelected()
  productId = getProductID()

  if productId = "episode" then
    m.rokuPay.purchaseEpisode(contentId)
  else if productId = "season" then
    m.rokuPay.purchaseSeason(1)
  else if productId = "all.access" then
    m.rokuPay.purchaseAllAccess()
  end if
end sub
```

---

## 🧪 Quick Test

```brightscript
' Test Roku Ads
m.ropkuAds.adUrl = "TEST_AD_URL"

' Test Roku Pay (after user signs in)
m.rokuPay.getProducts()  ' Should show product catalog
m.rokuPay.ownsProduct("tony.all.access")  ' Should return false initially
```

---

## 📊 Expected Flow

1. **Guest User Opens App**
   - Sees premium content with lock icons
   - Selects premium episode → prompted to purchase
   - Buys episode → entitlement synced to Supabase
   - Content plays (with ads)

2. **Premium User Opens App**
   - No lock icons on owned content
   - Selects premium episode → plays immediately
   - **No ads** during playback

3. **Free User Watching**
   - Pre-roll ad plays
   - Content plays
   - Mid-roll ad every 10 minutes
   - Post-roll ad after content

---

## 🎯 Next Steps

1. Download `Roku_Ads.brs` library
2. Configure your Roku IFA ad URL
3. Create products in Roku Channel Store
4. Run the SQL migration in Supabase
5. Test ad playback
6. Test purchase flow
7. Deploy to production

---

**See full guide:** `docs/ROKU_MONETIZATION.md`
