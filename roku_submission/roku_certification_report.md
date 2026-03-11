# Roku Channel Store Certification Analysis

As a Roku App Certification Expert, I have reviewed the T.O.N.Y. Roku app codebase against the official **Roku Channel Store requirements (Spring 2026/latest)**. 

Here is the certification readiness report.

## ✅ PASSED: Core Architecture & UI Requirements
The app passes the foundational technical requirements:
- **UI Resolutions:** Manifest correctly declares `ui_resolutions=hd,fhd` (720p and 1080p support).
- **Required Assets:** All required channel store images are properly sized and referenced in the manifest (`splash-hd`/`fhd`, `icon-focus-hd`/`fhd`, `icon-hd`/`fhd`/`sd`).
- **Focus Navigation:** `RowList` and `Video` nodes are used correctly with `setFocus()`, passing 5-way D-Pad navigation guidelines.
- **Partner Button (Back Button):** The app correctly implementing `confirm_partner_button=1` in the manifest and traps the `back` key with an exit confirmation dialog (`Dialog` node).
- **Content Rating:** `content_rating=TV-MA` is explicitly set in the manifest.

## ✅ PASSED: Video Playback & Deep Linking
Roku has strict requirements on how video acts and how channels launch:
- **Direct to Play (Deep Linking):** **Passed.** The manifest includes `supports_input_launch=1`. `main.brs` passes `contentId` and `mediaType` to `HomeScene.brs`, which validates the ID against the catalog and instantly starts playback via `startPlayback()`.
- **Bookmarks (Resume Playback):** **Passed.** Channels with content over 15 minutes MUST save position. The app uses `roRegistrySection` to save the position every 30 seconds and successfully resumes if `m.bookmarkPosition > 30`.
- **Trick Play (FF/RW):** **Passed.** The `Video` node has `enableTrickPlay="true"`, allowing Roku's native HLS trick play interface.
- **Error Handling:** **Passed.** `onVideoState()` traps `"error"`, hides the spinner, displays an error toast (`statusLabel`), and safely returns the user to the `RowList` without crashing.

## ⚠️ PENDING/REQUIRES ACTION: Monetization & Accounts
This is where the app will currently fail or get rejected by Roku QA, depending on your business model.

### 1. Roku Pay Integration (Required if selling access)
If T.O.N.Y. is a paid film, **Roku does not allow you to sell content on the web and make users log in on the TV without also offering purchase through Roku Pay.**
*   **Requirement:** Any app requiring a subscription or one-time purchase to view content MUST integrate `roChannelStore` (Roku Pay) to allow users to purchase directly on the device using their Roku account.
*   **Current Status:** The app hardcodes `available: true` for Episode 1 and `available: false` for others. There is no login screen or purchase flow on the device.
*   **Fix:** We need to implement an on-device authentication flow (linking code or keyboard login) and integrate Roku Pay for in-app purchases. (Alternatively, if this is a free ad-supported app, we must integrate the Roku Request for Ads Framework - RRAF).

### 2. Deep Linking Test Cases
*   **Requirement:** When submitting the app, Roku QA will run automated deep linking tests.
*   **Fix:** You must provide Roku with a valid `contentId` (e.g., `episode-one`) to use for the deep link test in the Developer Dashboard submission form.

### 3. Missing Channel Store Metadata
Before submission, you must prepare the following metadata on the Roku Developer Dashboard:
- **Store Poster:** A `540x405` JPEG/PNG (We generated this as `store-poster.png`).
- **Screenshots:** Up to 6 HD (1280x720) or FHD (1920x1080) screenshots.
- **Channel Description:** Web and TV descriptions.
- **Privacy Policy / Terms of Use URLs:** Required for all channels.
- **Test Account:** If you add authentication, you must provide Roku QA with a working test account (email/password) that has active entitlements.

## Summary Conclusion
From a BrightScript/SceneGraph engineering standpoint, **the app is incredibly robust and hits all the difficult technical benchmarks (Deep Linking, Bookmarks, Trick Play).** 

**The blocker is the business logic.** To pass certification, we must decide if the app is Free (needs Roku Ads), Paid (needs Roku Pay integration), or Authenticated (needs device linking flow).
