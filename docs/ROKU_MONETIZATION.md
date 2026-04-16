# Roku Ads & Roku Pay Integration Guide

Complete guide to monetizing your TONY Roku app with ads and purchases.

---

## 🎯 Overview

Two monetization strategies:

1. **Roku Ads (IFA)** - Free ad-supported viewing
2. **Roku Pay (Channel Store)** - Premium purchases

---

## 📺 Roku Ads Integration

### What It Does

- **Pre-roll ads** before content starts
- **Mid-roll ads** during playback (every 10 min)
- **Post-roll ads** after content ends
- **Banner ads** in UI (companion ads)
- **Premium users**: No ads
- **Guest users**: Full ad experience

### Setup Steps

#### 1. Get Roku Ads Library

Download the official Roku Ads library:
- Go to: https://developer.roku.com/en-gb/develop/monetization
- Download: `Roku_Ads.brs`
- Place in: `roku/components/` folder

#### 2. Configure Ad URL

In `roku/components/RokuAds.brs`, update the `getAdUrlForContent()` function:

```brightscript
function getAdUrlForContent(content as Object) as String
  appId = m.global.appInfo.id
  contentId = content.id

  ' Your Roku IFA ad URL (get from Roku Dashboard)
  adUrl = "http:// YOUR_Roku_IFA_AD_URL_HERE"

  return adUrl
end function
```

#### 3. Enable Ads in Content Player

In your video player component, add ad calls:

```brightscript
sub playContent(content as Object)
  ' Check if user is premium
  isPremium = m.global.user.isPremium

  if NOT isPremium then
    ' Show pre-roll ad
    m.ropkuAds.showPreroll(content)

    ' Wait for ad to complete
    waitAdCompletion()

    ' Start content
    playVideo(content)

    ' Set up mid-roll ads
    observeVideoPosition()
  else
    ' Premium: No ads, play directly
    playVideo(content)
  end if
end sub

sub observeVideoPosition()
  ' Check position every 30 seconds
  m.video.observeField("position", "onVideoPosition")

  sub onVideoPosition()
    position = m.video.position

    ' Show midroll every 10 minutes (600 seconds)
    if position MOD 600 = 0 AND position > 0 then
      m.ropkuAds.showMidroll(m.currentContent, position)
    end if
  end sub
end sub
```

#### 4. Add Roku Ads to Home Scene

In your main scene, initialize the ads component:

```brightscript
sub init()
  m.ropkuAds = m.top.findNode("rokuAds")
  m.ropkuAds.control = "run"

  ' Set up ad completion observer
  m.ropkuAds.observeField("adCompleted", "onAdCompleted")
end sub

sub onAdCompleted()
  ' Resume content playback
  playContent()
end sub
```

---

## 💳 Roku Pay Integration

### What It Does

Users can purchase:
- **Individual episodes** (e.g., Episode 2 for $1.99)
- **Full season** (e.g., Season 1 for $9.99)
- **All access pass** (e.g., All episodes for $19.99/year)

Purchases sync with Supabase backend for entitlement enforcement.

### Setup Steps

#### 1. Create Products in Roku Channel Store

Go to: https://developer.roku.com/en-gb/develop/monetization/channel-store

Create products with these IDs:

```
Product ID              Name              Price
------------------------------------------------
tony.episode.single     Single Episode    $1.99
tony.season.1           Season 1          $9.99
tony.all.access         All Access Pass   $19.99
```

#### 2. Initialize Roku Pay in Your App

In your authentication code, initialize after user signs in:

```brightscript
sub onUserSignedIn()
  ' Initialize Roku Pay
  m.rokuPay = m.top.findNode("rokuPay")
  m.rokuPay.control = "run"

  ' Fetch product catalog
  m.rokuPay.getProducts()

  ' Restore previous purchases
  m.rokuPay.restorePurchases()

  ' Update UI
  refreshHomeScreen()
end sub
```

#### 3. Show Purchase Options

When user selects premium content:

```brightscript
sub onContentSelected(content as Object)
  ' Check if user owns content
  ownsContent = checkEntitlement(content.id)

  if ownsContent then
    ' User owns it - play immediately
    playContent(content)
  else
    ' Show purchase dialog
    showPurchaseDialog(content)
  end if
end sub

sub showPurchaseDialog(content as Object)
  ' Create purchase dialog
  dialog = createObject("roSGNode", "Dialog")

  ' Get product prices
  episodePrice = m.rokuPay.getProductPrice("tony.episode.single")
  seasonPrice = m.rokuPay.getProductPrice("tony.season.1")
  allAccessPrice = m.rokuPay.getProductPrice("tony.all.access")

  dialog.title = "Unlock Premium Content"
  dialog.text = "Choose your purchase option:"

  ' Add buttons
  dialog.buttons = [
    "Buy This Episode " + episodePrice,
    "Buy Full Season " + seasonPrice,
    "Get All Access " + allAccessPrice,
    "Cancel"
  ]

  dialog.observeField("buttonSelected", "onPurchaseDialogButton")

  m.top.dialog = dialog
end sub

sub onPurchaseDialogButton()
  button = m.top.dialog.buttonSelected

  if button = 0 then
    ' Purchase episode
    m.rokuPay.purchaseEpisode(m.selectedContent.id)
  else if button = 1 then
    ' Purchase season
    m.rokuPay.purchaseSeason(1)
  else if button = 2 then
    ' Purchase all access
    m.rokuPay.purchaseAllAccess()
  end if

  m.top.dialog.close = true
end sub
```

#### 4. Handle Purchase Completion

```brightscript
sub init()
  ' ... other init code ...

  ' Observe purchase completion
  m.rokuPay.observeField("purchaseCompleted", "onPurchaseCompleted")
  m.rokuPay.observeField("purchaseError", "onPurchaseError")
end sub

sub onPurchaseCompleted()
  ' Show success message
  dialog = createObject("roSGNode", "Dialog")
  dialog.title = "Purchase Successful!"
  dialog.text = "You now have access to this content."
  dialog.buttons = ["OK"]

  m.top.dialog = dialog

  ' Refresh home screen to show unlocked content
  refreshHomeScreen()
end sub

sub onPurchaseError()
  ' Show error message
  dialog = createObject("roSGNode", "Dialog")
  dialog.title = "Purchase Failed"
  dialog.text = m.rokuPay.purchaseError
  dialog.buttons = ["OK"]

  m.top.dialog = dialog
end sub
```

---

## 🗄️ Backend Setup

### Run Migration

In Supabase Dashboard → SQL Editor, run:

```sql
-- Run this file:
-- supabase/migrations/20260312_roku_purchases.sql
```

This creates the `roku_purchases` table to track all purchases.

### API Endpoint

The `/api/roku-purchase` endpoint:
- Receives purchase data from Roku app
- Records in `roku_purchases` table
- Grants entitlement in `entitlements` table
- Syncs with existing backend

---

## 🧪 Testing

### Test Roku Ads

```brightscript
' In your component, force an ad
m.ropkuAds.adUrl = "http://test-ad-url.com"
' Should trigger ad playback
```

### Test Roku Pay (Sandbox)

1. **Enable test mode:**
   ```brightscript
   m.store = CreateObject("roChannelStore")
   m.store.SetTestMode(true)
   ```

2. **Make test purchases** (won't be charged)

3. **Check purchase history:**
   ```brightscript
   purchases = m.rokuPay.getPurchaseHistory()
   print purchases
   ```

---

## 🎨 UI Components

### Premium Badge

```brightscript
<Rectangle id="premiumBadge" width="80" height="30" color="0xFFD700FF">
  <Label text="PREMIUM" height="30" width="80" horizAlign="center" vertAlign="center" />
</Rectangle>
```

### Lock Icon

```brightscript
<Poster id="lockIcon" uri="pkg:/images/lock.png" width="40" height="40" />
```

### Purchase Dialog Example

```xml
<Dialog>
  <Label id="title" text="Unlock Premium Content" font="font:LargeBoldFont" />
  <Label id="episodeOption" text="Buy Episode - $1.99" />
  <Label id="seasonOption" text="Buy Season - $9.99" />
  <Label id="allAccessOption" text="All Access - $19.99" />
</Dialog>
```

---

## 📊 Analytics

### Track Ad Impressions

```brightscript
sub onAdPlaying()
  ' Send to analytics
  analytics.trackEvent("ad_impression", {
    adUrl: m.ropkuAds.adUrl,
    contentId: m.currentContent.id,
    timestamp: CreateObject("roDateTime").AsSeconds()
  })
end sub
```

### Track Purchases

```brightscript
sub onPurchaseCompleted()
  ' Send to analytics
  analytics.trackEvent("purchase_completed", {
    productId: m.rokuPay.productId,
    transactionId: m.rokuPay.transactionId,
    price: m.rokuPay.getProductPrice(m.rokuPay.productId)
  })
end sub
```

---

## 🚀 Deployment

### 1. Update Channel Store

Upload new version with:
- Roku Ads integration
- Roku Pay products configured

### 2. Deploy Backend

```bash
cd /Users/michaelshaw/dyad-apps/t.o.n.y.---top-of-new-york
git add api/roku-purchase.ts
git commit -m "Add Roku Pay purchase endpoint"
git push
```

### 3. Test on Real Device

- Sideload to Roku device
- Test ad playback
- Make test purchase
- Verify entitlement syncs

---

## 📝 Checklist

- [ ] Download `Roku_Ads.brs` from Roku Dashboard
- [ ] Add to `roku/components/` folder
- [ ] Configure ad URL in `RokuAds.brs`
- [ ] Create products in Roku Channel Store
- [ ] Run `roku_purchases.sql` migration in Supabase
- [ ] Deploy `/api/roku-purchase` endpoint
- [ ] Test ad playback
- [ ] Test purchase flow
- [ ] Verify entitlement sync

---

## 🔗 Resources

- [Roku Ads Documentation](https://developer.roku.com/en-gb/develop/monetization)
- [Roku Pay (Channel Store)](https://developer.roku.com/en-gb/develop/monetization/channel-store)
- [Roku IFA (Interactive Feed Ad)](https://developer.roku.com/en-gb/develop/monetization/ifa)

---

**Created:** March 12, 2026
**Version:** 1.0.0
