# Mock Backend Server

This is a simple Express.js server that mocks the AWS Lambda backend for local development.

## Why Use This?

The Bharat Sahayak backend is built with AWS Lambda functions, which normally require:
- AWS SAM CLI
- Docker Desktop
- AWS credentials
- Complex setup

This mock server lets you develop the frontend **without any of that complexity**.

## Quick Start

### 1. Install Dependencies

```bash
cd mock-backend
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Start the Frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` and start chatting!

## Features

✅ All main API endpoints mocked:
- `POST /chat` - Chat with AI (mock responses)
- `GET /schemes` - List welfare schemes
- `GET /schemes/:id` - Get scheme details
- `POST /eligibility-check` - Check eligibility
- `POST /voice-to-text` - Mock voice transcription
- `POST /text-to-speech` - Mock speech synthesis

✅ Session management
✅ Multilingual support (English & Hindi)
✅ CORS enabled
✅ Sample scheme data included

## API Endpoints

### Chat
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about agriculture schemes", "language": "en"}'
```

### List Schemes
```bash
curl http://localhost:3000/schemes
```

### Get Scheme Details
```bash
curl http://localhost:3000/schemes/pm-kisan
```

### Check Eligibility
```bash
curl -X POST http://localhost:3000/eligibility-check \
  -H "Content-Type: application/json" \
  -d '{
    "schemeId": "pm-kisan",
    "userInfo": {
      "age": 45,
      "income": 250000
    }
  }'
```

## Mock Data

The server includes 3 sample schemes:
1. **PM-KISAN** - Agriculture scheme
2. **Ayushman Bharat** - Health insurance
3. **MGNREGA** - Employment guarantee

## Limitations

This is a **mock server** for development only:
- ❌ No real AI (uses predefined responses)
- ❌ No real voice processing
- ❌ No database (in-memory storage)
- ❌ No AWS services integration
- ❌ Sessions reset on server restart

For production, you need to deploy the real AWS Lambda backend.

## Development

### Auto-reload on Changes

```bash
npm run dev
```

Uses nodemon to automatically restart on file changes.

### Add More Mock Data

Edit `server.js` and add more schemes to the `schemes` array or modify the `generateMockResponse` function.

## Troubleshooting

**Port 3000 already in use?**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Dependencies not installing?**
```bash
# Clear npm cache
npm cache clean --force
npm install
```

## Next Steps

Once you're ready for production:
1. Deploy the real backend using AWS SAM
2. Update frontend `.env` with the deployed API URL
3. Test with real AWS services

See [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment instructions.
