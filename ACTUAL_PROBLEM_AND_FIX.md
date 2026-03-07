# 🔴 ACTUAL PROBLEM IDENTIFIED

## The Real Issue

Your frontend is running on **port 3000** (wrong port), and the **backend is NOT running at all**.

### What's Happening:
1. ❌ Frontend Vite server is on port 3000 (should be on 5173)
2. ❌ Backend mock server is NOT running (should be on 3000)
3. ❌ When frontend tries to call `/chat`, it hits itself (the Vite server), which returns 404

### Why This Causes the Error:
```
Frontend (port 3000) → calls http://localhost:3000/chat
                    ↓
                Hits itself (Vite server)
                    ↓
                Vite doesn't have /chat endpoint
                    ↓
                Returns 404 Not Found ❌
```

## 🔧 THE FIX

You need to:
1. **Stop the current frontend server** (running on wrong port)
2. **Start the backend server** on port 3000
3. **Start the frontend server** on port 5173

### Step-by-Step Fix

#### Step 1: Stop Current Frontend Server

In the terminal where frontend is running:
```bash
Press Ctrl+C
```

#### Step 2: Start Backend Server

Open a **NEW terminal** and run:
```bash
cd mock-backend
npm start
```

**Wait for this message:**
```
🚀 Bharat Sahayak Mock Backend Server
✅ Server running on: http://localhost:3000
```

**✅ Verify backend is running:**
```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok","message":"Mock backend is running"}`

#### Step 3: Start Frontend Server (on correct port)

Open **ANOTHER terminal** and run:
```bash
cd frontend
npm run dev
```

**Wait for this message:**
```
Local: http://localhost:5173/
```

**✅ Verify frontend is running:**
Open browser: http://localhost:5173

### Step 4: Test the Chat

1. Go to http://localhost:5173/chat
2. Type a message: "Tell me about agriculture schemes"
3. Click Send
4. You should see a response! ✅

## 🎯 Quick Fix (Automated)

Instead of manual steps, use the automated script:

```bash
start-dev.bat
```

This will:
- ✅ Start backend on port 3000
- ✅ Start frontend on port 5173
- ✅ Open browser automatically

## 🔍 How to Verify Everything is Correct

### Check 1: Backend is on Port 3000
```bash
curl http://localhost:3000/health
```
**Expected:** `{"status":"ok","message":"Mock backend is running"}`

### Check 2: Frontend is on Port 5173
Open browser: http://localhost:5173
**Expected:** Bharat Sahayak landing page loads

### Check 3: Chat Endpoint Works
```bash
curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d "{\"message\":\"Hello\",\"language\":\"en\"}"
```
**Expected:** JSON response with `response`, `schemes`, `sessionId`

### Check 4: Frontend Can Call Backend
1. Open http://localhost:5173/chat
2. Open browser DevTools (F12) → Network tab
3. Send a message
4. Check Network tab for POST request to `http://localhost:3000/chat`
5. Should show Status: 200 OK ✅

## 🐛 Why Did Frontend Start on Port 3000?

Vite automatically uses the next available port if 5173 is taken. Possible reasons:
1. Another Vite server was already running on 5173
2. Port 5173 was blocked or in use
3. Vite config was modified

### To Force Vite to Use Port 5173:

**Option 1: Check vite.config.ts**
```typescript
// frontend/vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true, // Fail if port is already in use
  }
})
```

**Option 2: Specify port in command**
```bash
npm run dev -- --port 5173
```

## 📋 Correct Architecture

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Browser: http://localhost:5173                         │
│                                                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ User opens page
                 ↓
┌─────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                │
│  Port: 5173                                             │
│  Serves: HTML, CSS, JavaScript                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTP POST /chat
                 │ {"message": "Hello"}
                 ↓
┌─────────────────────────────────────────────────────────┐
│  Backend (Express Mock Server)                          │
│  Port: 3000                                             │
│  Endpoints: /chat, /schemes, /eligibility-check, etc.   │
└─────────────────────────────────────────────────────────┘
```

## 🎉 Success Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] `http://localhost:3000/health` returns OK
- [ ] `http://localhost:5173` shows landing page
- [ ] Chat page loads without errors
- [ ] Sending message returns response
- [ ] No 404 errors in browser console
- [ ] Scheme cards appear in chat

## 🚨 Common Mistakes to Avoid

1. ❌ Starting only frontend (need both!)
2. ❌ Starting frontend on port 3000 (should be 5173)
3. ❌ Not waiting for backend to fully start before testing
4. ❌ Closing terminal windows (keep both open!)
5. ❌ Not checking which port frontend actually started on

## 💡 Pro Tips

1. **Always start backend FIRST**, then frontend
2. **Check terminal output** to see which port each server uses
3. **Keep both terminals visible** so you can see logs
4. **Use the automated script** (`start-dev.bat`) to avoid mistakes
5. **Bookmark** http://localhost:5173 (not 3000!)

## 📞 Still Not Working?

If you still see 404 errors after following these steps:

1. **Kill all Node processes:**
   ```bash
   # Windows
   taskkill /F /IM node.exe
   
   # Linux/Mac
   killall node
   ```

2. **Clear ports:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :5173
   # Kill any processes using these ports
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

3. **Start fresh:**
   ```bash
   # Terminal 1
   cd mock-backend
   npm start
   
   # Terminal 2 (wait for backend to start)
   cd frontend
   npm run dev
   ```

4. **Check browser console** (F12) for detailed error messages

5. **Check terminal logs** for any error messages

---

**Remember: TWO servers, TWO ports, TWO terminals!**
- Backend: Port 3000
- Frontend: Port 5173
