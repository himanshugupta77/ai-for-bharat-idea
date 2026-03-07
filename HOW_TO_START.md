# 🚀 How to Start Bharat Sahayak

## You Need TWO Terminals Running!

### Terminal 1: Mock Backend (Port 3000)

```bash
cd mock-backend
npm install  # Only needed first time
npm start
```

**Wait for this message:**
```
🚀 Bharat Sahayak Mock Backend Server
✅ Server running on: http://localhost:3000
```

**Keep this terminal open!** Don't close it.

---

### Terminal 2: Frontend (Port 5173)

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

**Wait for this message:**
```
Local: http://localhost:5173/
```

**Keep this terminal open!** Don't close it.

---

## ✅ Verify Both Are Running

### Check Backend:
Open in browser: http://localhost:3000/health

Should show: `{"status":"ok","message":"Mock backend is running"}`

### Check Frontend:
Open in browser: http://localhost:5173

Should show the Bharat Sahayak landing page.

---

## 🎤 How to Use Voice Input

1. Go to http://localhost:5173/chat
2. Click the **microphone button** (circle icon)
3. **Allow microphone permission** when browser asks
4. Speak your message
5. Click the button again to stop
6. You'll see: "This is a mock transcription" (this is normal for mock backend)
7. Edit the text if needed
8. Click Send

---

## 💬 How to Use Text Chat

1. Go to http://localhost:5173/chat
2. Type your message in the text box
3. Click **Send** or press **Enter**
4. You'll get a response with scheme recommendations!

---

## 🛑 How to Stop

Close both terminal windows, or press **Ctrl+C** in each terminal.

---

## 🐛 If Something Doesn't Work

### Voice Recording Stuck?
→ **Backend is not running!** Start it in Terminal 1.

### Chat Not Working?
→ **Backend is not running!** Start it in Terminal 1.

### Microphone Permission Denied?
→ Click the 🔒 icon in browser address bar → Allow microphone

### Port Already in Use?
→ Kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## 📝 Quick Reference

| What | URL | Terminal |
|------|-----|----------|
| Backend API | http://localhost:3000 | Terminal 1 |
| Frontend App | http://localhost:5173 | Terminal 2 |
| Health Check | http://localhost:3000/health | - |
| Chat Page | http://localhost:5173/chat | - |

---

## 🎯 Remember

- **TWO terminals** must be running
- **Backend FIRST**, then frontend
- **Don't close** the terminals
- **Grant microphone permission** when asked

---

**That's it! You're ready to chat! 🎉**
