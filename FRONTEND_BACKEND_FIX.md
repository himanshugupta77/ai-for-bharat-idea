# Frontend-Backend Integration Fix

## Problem
The frontend was trying to connect to `http://localhost:3001/chat` but the backend API doesn't exist on that port.

## Solution Applied

### 1. Updated API Configuration

**File: `frontend/src/utils/constants.ts`**
- Changed default API URL from `http://localhost:3001` to `http://localhost:3000`

**File: `frontend/.env.local` (created)**
```
VITE_API_BASE_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```

### 2. How to Start the Application

#### Option A: Using SAM Local (Recommended)

**Terminal 1 - Start Backend:**
```bash
cd infrastructure
sam build
sam local start-api --port 3000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Access the app at: http://localhost:5173

#### Option B: Without SAM Local

If you don't have SAM CLI or Docker installed, you'll need to deploy to AWS and use the deployed API endpoint:

1. Deploy backend to AWS:
```bash
cd infrastructure
sam build
sam deploy --guided
```

2. Update frontend to use deployed API:
```bash
# In frontend/.env.local, replace with your API Gateway URL
VITE_API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/dev
```

3. Start frontend:
```bash
cd frontend
npm run dev
```

### 3. Verify the Fix

1. **Check backend is running:**
```bash
curl http://localhost:3000/schemes
```

You should see a JSON response with scheme data.

2. **Test chat endpoint:**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "language": "en"}'
```

3. **Test from browser:**
- Open http://localhost:5173
- Click "बातचीत शुरू करें" (Start Chatting) button
- Type a message and send
- You should see a response from the AI assistant

### 4. Troubleshooting

**Error: "sam: command not found"**
```bash
# Install AWS SAM CLI
# Windows (using Chocolatey):
choco install aws-sam-cli

# Mac (using Homebrew):
brew install aws-sam-cli

# Or follow official guide:
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
```

**Error: "Docker is not running"**
- SAM Local requires Docker to run Lambda functions locally
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/
- Start Docker Desktop before running `sam local start-api`

**Error: "Port 3000 already in use"**
```bash
# Option 1: Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Option 2: Use a different port
sam local start-api --port 3001
# Then update frontend/.env.local:
VITE_API_BASE_URL=http://localhost:3001
```

**Error: "Failed to load resource: 404"**
- Ensure backend is running: `curl http://localhost:3000/schemes`
- Check browser console for the exact URL being called
- Verify `.env.local` exists in frontend directory
- Restart frontend dev server after changing .env files: `npm run dev`

**Error: "CORS policy blocked"**
- This shouldn't happen with SAM local, but if it does:
- Check `infrastructure/template.yaml` CORS configuration
- Ensure `AllowOrigin` includes your frontend URL

**Error: "AWS credentials not configured"**
```bash
# Configure AWS CLI with your credentials
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

### 5. API Endpoints Available

When backend is running on http://localhost:3000:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send chat message to AI assistant |
| `/voice-to-text` | POST | Convert audio to text |
| `/text-to-speech` | POST | Convert text to audio |
| `/eligibility-check` | POST | Check scheme eligibility |
| `/schemes` | GET | List all welfare schemes |
| `/schemes/{id}` | GET | Get specific scheme details |

### 6. Testing the Chat Feature

**Using curl:**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "मुझे कृषि योजनाओं के बारे में बताएं",
    "language": "hi"
  }'
```

**Expected Response:**
```json
{
  "response": "यहाँ कुछ कृषि योजनाएं हैं...",
  "language": "hi",
  "schemes": [
    {
      "id": "pm-kisan",
      "name": "प्रधानमंत्री किसान सम्मान निधि",
      "description": "...",
      "eligibilitySummary": "...",
      "applicationSteps": [...]
    }
  ],
  "sessionId": "uuid-here"
}
```

### 7. Next Steps

Once you have the local development working:

1. **Seed the database** with scheme data:
```bash
cd backend
python scripts/seed_schemes.py
```

2. **Run tests** to ensure everything works:
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

3. **Deploy to AWS** when ready:
```bash
cd infrastructure
./scripts/deploy.sh dev
./scripts/deploy-frontend.sh dev
```

## Summary of Changes

✅ Fixed API base URL from port 3001 to 3000
✅ Created `.env.local` file for frontend configuration
✅ Updated `constants.ts` default port
✅ Created comprehensive setup documentation
✅ Added troubleshooting guide

The chat application should now work correctly when both backend and frontend are running!
