# 🎤 Voice Input Guide

## How Voice Input Works

### Step-by-Step Process:

1. **Click the microphone button** (circle icon)
2. **Allow microphone permission** (browser will ask first time)
3. **Speak your message** (you'll see "Recording..." in red)
4. **Click the button again to stop** recording
5. **The transcript appears in the text box** (not sent automatically!)
6. **Click "Send" button** to send the message

---

## Important: Voice Input Does NOT Auto-Send!

❌ **Common Misconception:**
"I speak, and the AI should respond automatically"

✅ **How It Actually Works:**
1. You speak → Recording happens
2. You stop → Transcript appears in text box
3. **You must click "Send"** → AI responds

This is by design so you can:
- Review what was transcribed
- Edit the text if needed
- Add more text before sending

---

## What the Mock Backend Does

The mock backend **does NOT actually transcribe your voice**. It returns a fixed message:

```
"Hello, I want to know about agriculture schemes"
```

This happens **regardless of what you actually say**.

### Why?

Real voice transcription requires:
- Amazon Transcribe (AWS service)
- Audio processing
- Language detection
- Complex setup

The mock backend is for **frontend development only**. It simulates the API response without needing AWS.

---

## Testing Voice Input

### Test 1: Check if Recording Works

1. Click microphone button
2. You should see:
   - Button changes shape (circle → rectangle)
   - "Recording..." appears in red above button
   - Animated waveform bars appear
3. Speak anything (doesn't matter what)
4. Click button again to stop
5. Check the text input box - should show:
   ```
   Hello, I want to know about agriculture schemes
   ```

### Test 2: Send the Transcript

1. After transcript appears in text box
2. Click the **"Send"** button
3. You should get a response about agriculture schemes

---

## Troubleshooting

### Issue: Nothing happens when I click microphone

**Possible causes:**
1. **Microphone permission denied**
   - Click 🔒 icon in browser address bar
   - Change microphone permission to "Allow"
   - Refresh page and try again

2. **No microphone detected**
   - Check if microphone is connected
   - Check Windows sound settings
   - Try a different browser

3. **Browser doesn't support Web Audio API**
   - Use Chrome, Edge, or Firefox (latest versions)
   - Safari on Mac should work too

### Issue: Recording starts but never stops

**Possible causes:**
1. **Backend not running**
   - Make sure mock backend is running on port 3000
   - Check: http://localhost:3000/health

2. **Network error**
   - Check browser console (F12) for errors
   - Look for red error messages

### Issue: Transcript doesn't appear in text box

**Possible causes:**
1. **Backend returned an error**
   - Check backend terminal for error messages
   - Check browser console (F12) for errors

2. **JavaScript error in frontend**
   - Check browser console (F12)
   - Look for red error messages

### Issue: I speak but transcript is always the same

**This is normal!** The mock backend always returns:
```
"Hello, I want to know about agriculture schemes"
```

For real transcription, you need to:
1. Deploy the real AWS backend
2. Configure Amazon Transcribe
3. Update frontend to use deployed API URL

---

## Browser Console Debugging

Press **F12** to open browser console, then:

### Check for Errors

Look in the "Console" tab for red error messages like:
- `NotAllowedError: Permission denied` → Microphone permission issue
- `NotFoundError: Requested device not found` → No microphone detected
- `Failed to fetch` → Backend not running
- `404 Not Found` → Wrong API URL

### Check Network Requests

1. Go to "Network" tab
2. Click microphone button
3. Look for request to `/voice-to-text`
4. Click on it to see:
   - Request payload (audio data)
   - Response (transcript)
   - Status code (should be 200)

---

## Backend Logs

When you use voice input, the backend terminal should show:

```
📢 Voice-to-text request received
   Audio data size: 12345 bytes
   Format: webm
✅ Returning mock transcript: Hello, I want to know about agriculture schemes
```

If you don't see this, the request isn't reaching the backend.

---

## Expected Behavior Summary

| Action | What Happens | What You See |
|--------|-------------|--------------|
| Click mic button | Recording starts | "Recording..." in red, waveform animation |
| Speak | Audio is captured | Waveform bars move (visual feedback) |
| Click button again | Recording stops, sends to backend | Button returns to circle shape |
| Backend processes | Returns mock transcript | Text appears in input box |
| Click "Send" | Sends message to chat API | AI responds with schemes |

---

## For Real Voice Transcription

To get actual voice transcription (not mock):

1. **Deploy AWS Backend:**
   ```bash
   cd infrastructure
   sam build
   sam deploy --guided
   ```

2. **Configure Amazon Transcribe:**
   - Enable in AWS Console
   - Set up IAM permissions
   - Configure language detection

3. **Update Frontend:**
   ```bash
   # In frontend/.env.local
   VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/prod
   ```

4. **Test:**
   - Voice input will now actually transcribe what you say
   - Supports 11 languages with auto-detection

---

## Quick Test Commands

### Test Backend Voice Endpoint:

```bash
curl -X POST http://localhost:3000/voice-to-text \
  -H "Content-Type: application/json" \
  -d '{"audioData":"fake-base64-data","format":"webm"}'
```

Expected response:
```json
{
  "transcript": "Hello, I want to know about agriculture schemes",
  "detectedLanguage": "en",
  "confidence": 0.95
}
```

---

## Summary

✅ **Voice input works in 2 steps:**
1. Record → Transcript appears in text box
2. Click Send → AI responds

✅ **Mock backend always returns the same transcript**
- This is normal for development
- Real transcription requires AWS deployment

✅ **Check browser console (F12) for errors**
- Microphone permission issues
- Network errors
- JavaScript errors

✅ **Check backend terminal for logs**
- Should see "Voice-to-text request received"
- Should see "Returning mock transcript"

---

**Need help? Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**
