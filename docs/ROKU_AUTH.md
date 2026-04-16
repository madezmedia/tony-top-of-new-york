# Roku Device Authentication Flow

This directory contains the API endpoints for Roku device authentication using Supabase.

## Authentication Flow

### Step 1: Roku Requests Device Code
**Endpoint:** `POST /api/device-code`

**Request Body:**
```json
{
  "device_id": "roku-device-unique-id"
}
```

**Response:**
```json
{
  "code": "ABC123",
  "device_id": "roku-device-unique-id",
  "expires_at": "2026-03-12T15:00:00.000Z",
  "status": "pending"
}
```

### Step 2: Roku Displays Code to User
The Roku app should display the 6-character code (e.g., "ABC123") and instruct the user to:
1. Go to https://www.topofnewyork.com/activate
2. Enter the code
3. Sign in to their account

### Step 3: User Activates Device
**Endpoint:** `POST /api/device-auth`

**Headers:**
```
Authorization: Bearer <user-supabase-token>
```

**Request Body:**
```json
{
  "code": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device successfully authorized",
  "device_id": "roku-device-unique-id"
}
```

### Step 4: Roku Polls for Status
**Endpoint:** `GET /api/device-status?code=ABC123&device_id=roku-device-unique-id`

**Polling Interval:** Every 5-10 seconds

**Response (Pending):**
```json
{
  "status": "pending",
  "message": "Waiting for user authentication"
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    ...
  }
}
```

## Setup Instructions

### 1. Database Setup

Run the SQL migration in Supabase:
```bash
# Go to Supabase Dashboard → SQL Editor
# Copy and run the contents of: supabase/migrations/20260312_device_codes.sql
```

Or use the Supabase CLI:
```bash
supabase db push
```

### 2. Environment Variables

Ensure these environment variables are set in your Vercel deployment:
- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Deploy to Vercel

The API endpoints are automatically deployed when you push to GitHub:
```bash
git add api/device-code.ts api/device-status.ts api/device-auth.ts
git commit -m "Add Roku device authentication endpoints"
git push
```

### 4. Create Activation Page (Optional)

Create a webpage at `/activate` where users can enter their device code:

```tsx
// pages/activate.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Activate() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');

  const handleActivate = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch('/api/device-auth', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: code.toUpperCase() }),
    });

    const result = await response.json();

    if (result.success) {
      setStatus('Success! Your Roku device is now activated.');
    } else {
      setStatus(result.error || 'Activation failed');
    }
  };

  return (
    <div>
      <h1>Activate Your Roku Device</h1>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter 6-character code"
        maxLength={6}
      />
      <button onClick={handleActivate}>Activate</button>
      {status && <p>{status}</p>}
    </div>
  );
}
```

## Roku Channel Code Example

```brightscript
sub requestDeviceCode()
  deviceId = GetDeviceId()
  request = CreateObject("roUrlTransfer")
  request.SetUrl("https://www.topofnewyork.com/api/device-code")
  request.AddHeader("Content-Type", "application/json")

  json = FormatJson({device_id: deviceId})
  response = request.PostToString(json)

  if response <> invalid then
    data = ParseJson(response)
    ShowActivationScreen(data.code)
    startStatusPolling(data.code, deviceId)
  end if
end sub

sub startStatusPolling(code, deviceId)
  timer = CreateObject("roTimer")
  timer.SetElapsed_time(5000) ' Poll every 5 seconds
  timerPort = CreateObject("roMessagePort")
  timer.SetMessagePort(timerPort)
  timer.Start()

  while true
    msg = wait(0, timerPort)
    if type(msg) = "roTimerEvent" then
      checkStatus(code, deviceId)
    end if
  end while
end sub

sub checkStatus(code, deviceId)
  url = "https://www.topofnewyork.com/api/device-status?code=" + code + "&device_id=" + deviceId
  request = CreateObject("roUrlTransfer")
  request.SetUrl(url)
  response = request.GetToString()

  if response <> invalid then
    data = ParseJson(response)
    if data.status = "completed" then
      ' User authenticated successfully!
      SaveUserSession(data.user)
      ShowContent()
    end if
  end if
end sub
```

## Security Notes

1. **Code Expiry:** Device codes expire after 15 minutes
2. **One-Time Use:** Each code can only be used once
3. **HTTPS Only:** All endpoints must be accessed over HTTPS
4. **Rate Limiting:** Consider adding rate limiting to prevent abuse
5. **Device Binding:** Each code is bound to a specific device_id

## Testing

### Test the Flow

1. **Generate a device code:**
```bash
curl -X POST https://www.topofnewyork.com/api/device-code \
  -H "Content-Type: application/json" \
  -d '{"device_id": "test-device-123"}'
```

2. **Check status (should be pending):**
```bash
curl "https://www.topofnewyork.com/api/device-status?code=ABC123&device_id=test-device-123"
```

3. **Get a user token from Supabase:**
```bash
# First sign in or sign up via Supabase to get a token
```

4. **Authorize the device:**
```bash
curl -X POST https://www.topofnewyork.com/api/device-auth \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123"}'
```

5. **Check status again (should be completed):**
```bash
curl "https://www.topofnewyork.com/api/device-status?code=ABC123&device_id=test-device-123"
```

## Troubleshooting

### Error: "Method not allowed"
- Ensure you're using POST for `/api/device-code` and `/api/device-auth`
- Ensure you're using GET for `/api/device-status`

### Error: "Device code not found"
- Check that the code exists in the database
- Verify the code hasn't expired (15-minute window)

### Error: "Invalid or expired token"
- Ensure the user is signed in with Supabase
- Check that the Authorization header includes "Bearer " prefix

### Code keeps returning "pending"
- Verify the user has completed authorization on the website
- Check the Supabase logs for any errors
- Ensure the device-auth endpoint is being called with a valid user token
