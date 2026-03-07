# Quick Start Guide - Bharat Sahayak

## 🚀 Fastest Way to Start

### Windows Users

Double-click `start-dev.bat` or run:
```cmd
start-dev.bat
```

### Linux/Mac Users

```bash
chmod +x start-dev.sh
./start-dev.sh
```

This will automatically:
1. Start the backend API on http://localhost:3000
2. Start the frontend on http://localhost:5173
3. Open the app in your browser

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Docker Desktop** - Running (required for SAM local)
- ✅ **AWS SAM CLI** - Installed
- ✅ **Node.js 20+** - Installed
- ✅ **Python 3.12+** - Installed
- ✅ **AWS CLI** - Configured with credentials

### Quick Install Commands

**Windows (using Chocolatey):**
```cmd
choco install docker-desktop aws-sam-cli nodejs python
```

**Mac (using Homebrew):**
```bash
brew install --cask docker
brew install aws-sam-cli node python@3.12
```

**Configure AWS:**
```bash
aws configure
```

---

## 🔧 Manual Setup

If the automated scripts don't work, follow these steps:

### Step 1: Start Backend

```bash
# Terminal 1
cd infrastructure
sam build
sam local start-api --port 3000
```

Wait until you see: `Running on http://127.0.0.1:3000/`

### Step 2: Start Frontend

```bash
# Terminal 2
cd frontend
npm install  # First time only
npm run dev
```

Wait until you see: `Local: http://localhost:5173/`

### Step 3: Open Browser

Navigate to: http://localhost:5173

---

## ✅ Verify It's Working

### Test Backend

```bash
curl http://localhost:3000/schemes
```

Should return JSON with scheme data.

### Test Frontend

1. Open http://localhost:5173
2. You should see the landing page with "भारत सहायक" title
3. Click "बातचीत शुरू करें" button
4. Type a message and send
5. You should receive a response

---

## 🐛 Common Issues & Fixes

### Issue 1: "Failed to load resource: 404"

**Cause:** Backend not running or wrong port

**Fix:**
```bash
# Check if backend is running
curl http://localhost:3000/schemes

# If not, start it:
cd infrastructure
sam local start-api --port 3000
```

### Issue 2: "Docker is not running"

**Cause:** Docker Desktop not started

**Fix:**
- Start Docker Desktop application
- Wait for it to fully start (whale icon in system tray)
- Try again

### Issue 3: "Port 3000 already in use"

**Cause:** Another application using port 3000

**Fix:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac - Kill process
lsof -ti:3000 | xargs kill -9
```

### Issue 4: "sam: command not found"

**Cause:** AWS SAM CLI not installed

**Fix:**
```bash
# Windows
choco install aws-sam-cli

# Mac
brew install aws-sam-cli

# Or follow: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
```

### Issue 5: "AWS credentials not configured"

**Cause:** AWS CLI not configured

**Fix:**
```bash
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., ap-south-1)
# - Default output format (json)
```

### Issue 6: Black screen on landing page

**Cause:** Dark mode enabled by system preference

**Fix:** Already fixed! The app now defaults to light mode to show the saffron-white-green gradient properly.

---

## 📚 API Endpoints

When backend is running on http://localhost:3000:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Chat with AI assistant |
| `/voice-to-text` | POST | Convert voice to text |
| `/text-to-speech` | POST | Convert text to speech |
| `/eligibility-check` | POST | Check scheme eligibility |
| `/schemes` | GET | List all schemes |
| `/schemes/{id}` | GET | Get scheme details |

---

## 🧪 Test the Chat Feature

### Using curl:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about agriculture schemes",
    "language": "en"
  }'
```

### Using the UI:

1. Go to http://localhost:5173
2. Click "बातचीत शुरू करें" (Start Chatting)
3. Type: "Tell me about agriculture schemes"
4. Press Send or hit Enter
5. You should see AI response with scheme recommendations

---

## 📖 Additional Documentation

- **Full Setup Guide:** [LOCAL_DEVELOPMENT_SETUP.md](./LOCAL_DEVELOPMENT_SETUP.md)
- **Fix Details:** [FRONTEND_BACKEND_FIX.md](./FRONTEND_BACKEND_FIX.md)
- **Developer Guide:** [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)
- **API Documentation:** [docs/API.md](./docs/API.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎯 What Was Fixed

The frontend was trying to connect to `http://localhost:3001/chat` but the backend runs on port `3000`.

**Changes made:**
1. ✅ Updated `frontend/src/utils/constants.ts` - Changed default port from 3001 to 3000
2. ✅ Created `frontend/.env.local` - Set `VITE_API_BASE_URL=http://localhost:3000`
3. ✅ Fixed dark mode issue - App now defaults to light mode
4. ✅ Created startup scripts - `start-dev.bat` and `start-dev.sh`
5. ✅ Added comprehensive documentation

---

## 🚀 Next Steps

Once you have local development working:

1. **Seed the database** with scheme data:
```bash
cd backend
python scripts/seed_schemes.py
```

2. **Run tests:**
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

3. **Deploy to AWS:**
```bash
cd infrastructure
./scripts/deploy.sh dev
```

---

## 💡 Tips

- Keep both terminal windows open while developing
- Backend changes require restarting SAM local
- Frontend changes hot-reload automatically
- Check `backend.log` and `frontend.log` for errors
- Use browser DevTools (F12) to debug frontend issues
- Use CloudWatch Logs to debug deployed Lambda functions

---

## 🆘 Still Having Issues?

1. Check the troubleshooting section above
2. Review [FRONTEND_BACKEND_FIX.md](./FRONTEND_BACKEND_FIX.md)
3. Check [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)
4. Ensure all prerequisites are installed and running
5. Verify AWS credentials are configured correctly

---

**Happy Coding! 🎉**
