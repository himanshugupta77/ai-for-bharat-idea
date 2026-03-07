# 🚀 START HERE - Bharat Sahayak Quick Setup

## ⚡ Fastest Way to Get Started (No AWS/Docker Required!)

### Step 1: Install Mock Backend Dependencies

```bash
cd mock-backend
npm install
```

### Step 2: Start Mock Backend

```bash
# In terminal 1
cd mock-backend
npm start
```

You should see:
```
🚀 Bharat Sahayak Mock Backend Server
✅ Server running on: http://localhost:3000
```

### Step 3: Start Frontend

```bash
# In terminal 2
cd frontend
npm install  # First time only
npm run dev
```

You should see:
```
Local: http://localhost:5173/
```

### Step 4: Open Browser

Go to: **http://localhost:5173**

Click "बातचीत शुरू करें" (Start Chatting) and type a message!

---

## ✅ Verify It's Working

### Test 1: Check Backend

Open: http://localhost:3000/health

Should show: `{"status":"ok","message":"Mock backend is running"}`

### Test 2: Test Chat

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en"}'
```

### Test 3: Use the UI

1. Open http://localhost:5173
2. Click "बातचीत शुरू करें"
3. Type: "Tell me about agriculture schemes"
4. You should get a response with scheme recommendations!

---

## 🎯 What This Mock Backend Does

✅ Simulates all AWS Lambda functions
✅ Provides sample welfare scheme data
✅ Responds to chat messages with relevant schemes
✅ No AWS account needed
✅ No Docker needed
✅ No SAM CLI needed

**Perfect for frontend development!**

---

## 🐛 Troubleshooting

### Error: "Port 3000 already in use"

**Windows:**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Error: "Cannot find module 'express'"

```bash
cd mock-backend
npm install
```

### Error: "npm: command not found"

Install Node.js from: https://nodejs.org/

### Frontend still shows 404 error

1. Make sure mock backend is running on port 3000
2. Check browser console for the exact URL being called
3. Verify `.env.local` exists in frontend folder with:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```
4. Restart frontend: `npm run dev`

---

## 📝 Sample Schemes Included

The mock backend includes 3 sample schemes:

1. **PM-KISAN** - Agriculture scheme (₹6000/year for farmers)
2. **Ayushman Bharat** - Health insurance (₹5 lakh cover)
3. **MGNREGA** - Employment guarantee (100 days work)

---

## 🔄 For Production Deployment

When you're ready to deploy to AWS:

1. See [DEPLOYMENT.md](./DEPLOYMENT.md) for AWS setup
2. Deploy backend using SAM CLI
3. Update frontend `.env` with deployed API URL
4. Deploy frontend to S3/CloudFront

---

## 📚 More Documentation

- **Mock Backend Details**: [mock-backend/README.md](./mock-backend/README.md)
- **Full Setup Guide**: [LOCAL_DEVELOPMENT_SETUP.md](./LOCAL_DEVELOPMENT_SETUP.md)
- **Fix Documentation**: [FRONTEND_BACKEND_FIX.md](./FRONTEND_BACKEND_FIX.md)
- **Quick Start**: [QUICK_START.md](./QUICK_START.md)

---

## 💡 Tips

- Mock backend uses in-memory storage (resets on restart)
- Responses are predefined (not real AI)
- Perfect for UI/UX development
- Switch to real backend when you need AWS services

---

**You're all set! Happy coding! 🎉**
