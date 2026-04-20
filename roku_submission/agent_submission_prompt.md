# Autonomous Agent Prompt: Roku Channel Submission

**Agent Goal:** Submit a prepared Roku TV application codebase to the Roku Developer Dashboard for official Channel Store Certification. 

**Context:** The primary developer has bundled the application source code into a `.zip` file and prepared a Markdown cheat sheet containing all required strings, test credentials, and monetization assertions. Your task is to act as the deployment engineer, physically navigating the web portal to fill out the forms and upload the assets.

## Required Context Files to Parse

Before executing Browser Tools, read the following files from the local environment:
1. `roku_submission/roku_certification_cheat_sheet.md`: Contains all string values, text content, and testing configurations needed to fill out the forms.
2. `roku_submission/tony-roku-app.zip`: The physical codebase you must upload.
3. (Optional) Image assets located in the project's public image repository matching the dimensions detailed in the cheat sheet for posters and screenshots.

## Step-by-Step Execution Protocol

1. **Authentication:**
   - Navigate to `https://developer.roku.com/`. 
   - Click "Sign In" and authenticate. Pause and wait for the User if encountering Multi-Factor Authentication (MFA) prompts.
   - Once logged in, navigate to the **Dashboard**.

2. **Initialize Channel:**
   - Click **Manage Channels** or **Add Channel**.
   - Select **Developer SDK** as the channel type (do *not* select Direct Publisher).
   - Enter the Channel Name parsed from the cheat sheet ("T.O.N.Y.").

3. **Populate Properties:**
   - Proceed to the **Channel Properties** tab.
   - Inject the localized "Description (Web)" and "Description (Device)" strings.
   - Set the designated `Category` and `Content Rating`.

4. **Upload Store Assets:**
   - Navigate to the **Channel Store Assets** tab.
   - Use browser uploading capabilities to attach the required `1920x1080` FHD Poster, `1280x720` HD Poster, and the in-app screenshots. Ensure all images are populated before saving.

5. **Package Upload:**
   - Navigate to the **Package Upload** tab.
   - Upload the local `roku_submission/tony-roku-app.zip` footprint. Note the package version.

6. **Legal & Support Info:**
   - Navigate to the **Support Information** tab.
   - Paste the `Privacy Policy URL`, `Terms of Use URL`, and `Support Email`.

7. **Monetization & Test Config (CRITICAL):**
   - Navigate to the **Monetization** tab.
   - Explicitly flag the monetization intent bypassing Roku Pay as documented in the cheat sheet.
   - Check "Requires account linking/authentication."
   - Paste the highly specific Authentication Flow instructional paragraph.
   - Paste the testing Email and testing Password explicitly detailed in the cheat sheet so QA bots can bypass the TV linkage protocol.
   - Supply the Deep Linking attributes (`episode-one` / `episode`) when prompted for Test Keys. 

8. **Final Review & Submit:**
   - Navigate to the **Preview and Publish** tab.
   - Verify that all static analysis checks pass with Green marks (the `.zip` is pre-engineered to pass RSG 1.3 Memory checks).
   - Click **Submit for Review/Certification**. Ensure you do not accidentally select beta publication unless explicitly asked.

## Exception Handling
If Roku Static Analysis produces an error regarding missing BrightScript dependencies immediately upon ZIP upload, Halt execution. Do not proceed to fill out forms. Alert the human developer and provide the exact exception trace.
