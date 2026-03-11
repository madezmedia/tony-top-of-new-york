# T.O.N.Y. Roku Channel Store Submission Checklist

This document contains everything you need to successfully submit the completed `tony-roku-app.zip` to the Roku Developer Dashboard for certification.

## 1. Basic Channel Information
This info goes into the **„Channel Properties”** tab on the Roku Developer Dashboard.

*   **Channel Name:** T.O.N.Y.
*   **Description (Web):** Michael Cortez returns to the Bronx after years away, only to find the neighborhood he left behind has changed — and the enemies he made haven't forgotten. Watch the independent crime saga *T.O.N.Y. - Top of New York* created by Michael Steven-Paul.
*   **Description (Device):** Michael Cortez returns to the Bronx after years away, only to find the neighborhood he left behind has changed. Watch the independent crime saga *T.O.N.Y. - Top of New York*.
*   **Category:** Movies & TV
*   **Content Rating:** TV-MA (Mature Audiences Only)

## 2. Branding & Images
You must upload these assets to the **„Channel Store Assets”** tab.

*   **Channel Poster (FHD):** You must provide a `1920x1080` JPEG or PNG image. (This is generally your hero artwork).
*   **Channel Poster (HD):** You must provide a `1280x720` JPEG or PNG image.
*   **Screenshots (FHD/HD):** Up to 6 screenshots. You can take these by running the app on your developer Roku device, pressing `Home` 3 times, `Up` 2 times, `Right`, `Left`, `Right`, `Left`, `Right`, selecting „Enable Screen Shots,” and then accessing your Roku's IP via a web browser.

## 3. Legal & Compliance
These URLs are required on the **„Support Information”** tab.

*   **Privacy Policy URL:** `https://topofnewyork.com/privacy`
*   **Terms of Use URL:** `https://topofnewyork.com/terms`
*   **Support Email:** (Your support email address, e.g., `support@topofnewyork.com`)

## 4. Monetization & Authentication (CRITICAL)
Your app uses a "Freemium" model via *Device Linking* to a web account. You must explicitly configure this to pass QA.

*   **Monetization Option:** You must select **"My channel contains in-app purchases or subscriptions, but they are NOT processed through Roku Pay"** (or the equivalent option for TV Everywhere/Account Linking). 
    * *Note: If Roku rejects this and strictly enforces Roku Pay for digital SVOD/TVOD purchases, we will need to implement the `roChannelStore` BrightScript API to allow users to buy directly through their TV remote.*
*   **Require Account:** Set to **"Yes, requires account linking/authentication."**
*   **Authentication Flow:** Describe it for the QA tester: *"Users are presented with a 6-digit code on the TV (`AccountScene`). They visit `topofnewyork.com/activate` on a secondary device, log in, and enter the code to link their TV to their web account."*
*   **Test Credentials:** You **MUST** provide Roku QA with an existing, working account so they can test premium content.
    *   **Test Username/Email:** (Create a dummy account in Supabase, e.g., `roku-qa@topofnewyork.com`)
    *   **Test Password:** (e.g., `RokuTest2026!`)
    *   *Make sure this account has an active purchase/entitlement for Episode 1 or a Season Pass in your Supabase `entitlements` table!*

## 5. Technical Certification Requirements (Deep Linking)
Roku runs automated tests on your submitted package. One of these is Deep Linking.

*   **Does your channel support deep linking?** Yes.
*   **Test Content ID:** `episode-one`
*   **Test Media Type:** `movie` or `episode`
*   *(When the automated tester launches with `contentId=episode-one`, the app will automatically bypass the home screen and start playing the episode).*

## 6. Sideloading & Testing Locally
Before clicking submit, always test the final build on your own TV.

1. Turn on "Developer Mode" on your Roku TV (Home x3, Up x2, Right, Left, Right, Left, Right).
2. Note the IP address and password.
3. Open a browser and go to `http://<YOUR_ROKU_IP>`.
4. Upload the `tony-roku-app.zip` package.
5. Watch it launch on your TV! Test the `Account / Link TV` button, generate a code, and successfully link it using your phone.
