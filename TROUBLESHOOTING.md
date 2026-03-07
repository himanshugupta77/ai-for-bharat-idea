# Troubleshooting Guide

## Issue: Voice Recording Stuck on "Recording..."

### Symptoms
- Click microphone button
- Shows "Recording..." in red
- Never stops or processes the audio
- No response in chat

### Root Cause
**The mock backend is not running!**

### Solution

#### Step 1: Start the Mock Backend

Open a **NEW terminal** and run:

```bash
cd mock-backend
npm install  # First time only
npm start
```

You should see:
```
🚀 Bharat Sahayak Mock Backend Server
✅ Server running on: http://localhost:3000
```

#### Step 2: Verify Backend is Running

Open in browser: http://localhost:3000/health

Should show: `{"status":"ok","message":"Mock backend is running"}`

#### Step 3: Test Voice Recording Again

1. Go back to http://localhost:5173/chat
2. Click the microphone button
3. Allow microphone permission if prompted
4. Speak something
5. Click the button again to stop
6. You should see a mock transcript appear

---

## Issue: Chat Not Working / 404 Errors

### Symptoms
- Type a message and click Send
- Get error: "An error occurred while processing your request"
- Browser console shows: `Failed to load resource: 404 (Not Found)`

### Root Cause
**The mock backend is not running!**

### Solution

Same as above - start the mock backend:

```bash
cd mock-backend
npm install
npm start
```

---

## Issue: Microphone Permission Denied

### Symptoms
- Click microphone button
- Browser shows "Permission denied" or similar error
- Recording doesn't start

### Solution

#### Chrome/Edge:
1. Click the 🔒 or ⓘ icon in the address bar
2. Find "Microphone" permission
3. Change to "Allow"
4. Refresh the page

#### Firefox:
1. Click the 🔒 icon in the address bar
2. Click "Connection secure" → "More information"
3. Go to "Permissions" tab
4. Find "Use the Microphone"
5. Uncheck "Use Default" and select "Allow"
6. Refresh the page

---

## Issue: Voice Recording Works But No Transcript

### Symptoms
- Recording starts and stops successfully
- But no text appears in the chat input

### Root Cause
The mock backend returns a generic mock transcript. It doesn't actually transcribe your voice.

### Expected Behavior
When you stop recording, you should see:
```
"This is a mock transcription"
```

This is normal for the mock backend. For real transcription, you need to:
1. Deploy the real AWS backend with Amazon Transcribe
2. Update frontend to use the deployed API URL

---

## Issue: Port 3000 Already in Use

### Symptoms
```
Error: listen EADDRINUSE: address already in use :::3000
```

### Solution

**Windows:**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill -9
```

Then start the mock backend again.

---

## Issue: npm install Fails

### Symptoms
```
npm ERR! code ENOENT
npm ERR! syscall open
```

### Solution

1. Make sure you're in the correct directory:
   ```bash
   cd mock-backend
   pwd  # Should show: .../chatbot2/mock-backend
   ```

2. Check if package.json exists:
   ```bash
   ls package.json
   ```

3. If package.json is missing, the mock-backend folder wasn't created properly. Re-run the setup.

4. Clear npm cache and try again:
   ```bash
   npm cache clean --force
   npm install
   ```

---

## Issue: Frontend Shows Blank Page

### Symptoms
- Navigate to http://localhost:5173
- Page is completely blank or shows loading forever

### Solution

1. Check if frontend dev server is running
2. Look for errors in the terminal where you ran `npm run dev`
3. Check browser console (F12) for errors
4. Try clearing browser cache (Ctrl+Shift+Delete)
5. Restart frontend:
   ```bash
   cd frontend
   npm run dev
   ```

---

## Issue: Dark Background Instead of Gradient

### Symptoms
- Landing page shows dark/black background
- Can't see the saffron-white-green gradient

### Solution

This was already fixed! The app now defaults to light mode.

If you still see dark mode:
1. Clear browser cache
2. Clear localStorage:
   - Open browser console (F12)
   - Type: `localStorage.clear()`
   - Press Enter
   - Refresh page

---

## Quick Checklist

Before reporting an issue, verify:

- [ ] Mock backend is running on port 3000
- [ ] Frontend is running on port 5173
- [ ] Browser console shows no errors (F12)
- [ ] Microphone permission is granted
- [ ] `.env.local` exists in frontend folder
- [ ] Both terminals are still open and running

---

## Still Having Issues?

### Check Backend Status

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok","message":"Mock backend is running"}`

### Check Frontend Status

Open: http://localhost:5173

Should show the Bharat Sahayak landing page.

### Check Browser Console

1. Press F12 to open DevTools
2. Go to "Console" tab
3. Look for red error messages
4. Share the error messages for help

### Test API Directly

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en"}'
```

Should return a JSON response with schemes.

---

## Common Error Messages

### "Failed to load resource: net::ERR_CONNECTION_REFUSED"
→ Backend is not running. Start it with `cd mock-backend && npm start`

### "Failed to load resource: 404 (Not Found)"
→ Backend is running but on wrong port, or frontend is calling wrong URL

### "TypeError: Failed to fetch"
→ Network error, CORS issue, or backend crashed

### "NotAllowedError: Permission denied"
→ Microphone permission not granted. Check browser settings.

### "NotFoundError: Requested device not found"
→ No microphone detected. Check if microphone is connected.

---

## Need More Help?

1. Read [START_HERE.md](./START_HERE.md) for setup instructions
2. Read [mock-backend/README.md](./mock-backend/README.md) for backend details
3. Check [FRONTEND_BACKEND_FIX.md](./FRONTEND_BACKEND_FIX.md) for integration details
