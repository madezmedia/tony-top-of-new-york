# T.O.N.Y. Roku Certification Cheat Sheet (2026 Standards)

Roku's newest automated Static Analysis and Channel Behavior Analysis tools strictly enforce the 2026 mandates (RSG 1.3, App Memory Monitoring, and deep linking). Use this copy-and-paste guide to easily navigate the **Roku Developer Dashboard** submission process.

---

## 1. Channel Properties

**Channel Name:** 
```text
T.O.N.Y.
```

**Description (Web):** 
```text
Michael Cortez returns to the Bronx after years away, only to find the neighborhood he left behind has changed — and the enemies he made haven't forgotten. Watch the independent crime saga T.O.N.Y. - Top of New York created by Michael Steven-Paul.
```

**Description (Device):** 
```text
Michael Cortez returns to the Bronx after years away, only to find the neighborhood he left behind has changed. Watch the independent crime saga T.O.N.Y. - Top of New York.
```

**Category:** 
```text
Movies & TV
```

**Content Rating:** 
```text
TV-MA (Mature Audiences Only)
```

---

## 2. Channel Store Assets

Have these perfectly sized images ready to drag and drop:

*   **Channel Poster (FHD):** `1920x1080` (JPEG or PNG)
*   **Channel Poster (HD):** `1280x720` (JPEG or PNG)
*   **Screenshots:** Up to 6 in-app screenshots. *(Capture these by enabling the localized Roku debugging tool: Home x3, Up x2, Right, Left, Right, Left, Right — Enable Screen Shots).*

---

## 3. Support Information

**Privacy Policy URL:** 
```text
https://topofnewyork.com/privacy
```

**Terms of Use URL:** 
```text
https://topofnewyork.com/terms
```

**Support Email:** 
```text
shawsupplyco@gmail.com
```

*(Note: Verify this inbox is actively monitored during the review phase, as Roku QA may request clarification here).*

---

## 4. Monetization & Authentication (CRITICAL)

Because the app utilizes a "freemium" cross-platform linking model instead of processing digital SVOD logic strictly through the TV remote, test credentials are required.

**Monetization Option:**
> ☑ **"My channel contains in-app purchases or subscriptions, but they are NOT processed through Roku Pay"** 

**Require Account:**
> ☑ **"Yes, requires account linking/authentication."**

**Authentication Flow:**
```text
Users launch the app and are presented with a 6-digit code on the TV alongside a URL. They visit topofnewyork.com/activate on a mobile device or PC, log in to their account, and enter the code to link their TV to their web account.
```

**Test Credentials:** 
Provide Roku QA with an existing, fully activated account so they can immediately bypass the linking screen and test premium content streams.

**Test Username/Email:** 
```text
roku-qa@topofnewyork.com
```

**Test Password:** 
```text
RokuTest2026!
```

> [!WARNING]
> Before pressing submit, you **must** create the `roku-qa@topofnewyork.com` record inside your Supabase database and ensure it possesses a valid `entitlement` record (or subscription flag) to unlock Episode 1 playback!

---

## 5. Technical Requirements Checklist (2026 Automations)

Roku's Static Analysis bots will immediately check your `.zip` before humans even see it. Your packaged codebase (`tony-roku-app.zip`) has already been updated to comply with these:

*   [x] **RSG 1.3 Target:** The `manifest` declares `rsg_version=1.3` (Failure to do so causes instant rejection in October 2026).
*   [x] **App Memory Monitor:** Evaluated and initialized `roAppMemoryMonitor` in `main.brs`. This prevents the automated static analysis failure.
*   [x] **Deep Linking Enabled:** Deep linking is enforced for all content categories except Live TV. Our app handles `contentId` and `mediaType` passed through Launch Arguments.

**Deep Linking Testing Identifiers:**
When prompted for a test Deep Link ID, use these values:
*   **Test Content ID:** `episode-one`
*   **Test Media Type:** `episode`

---

## 6. Sideloading (Pre-Submission Check)

Before uploading to the Dashboard, double check everything on your own Roku TV.

1. Turn on Developer Mode on your Roku TV (Press remote buttons: `Home 3x, Up 2x, Right, Left, Right, Left, Right`).
2. Input the exact IP address shown on your TV screen into your laptop's browser.
3. Upload `roku_submission/tony-roku-app.zip` to the developer server interface.
4. If it launches smoothly without crashing and correctly parses the newly added Memory Monitor API, you are clear to submit it to the channel store!
