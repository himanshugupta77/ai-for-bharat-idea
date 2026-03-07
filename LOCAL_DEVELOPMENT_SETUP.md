# Local Development Setup Guide

## Quick Start

### 1. Start the Backend (SAM Local API)

```bash
# Navigate to infrastructure directory
cd infrastructure

# Start the local API Gateway and Lambda functions
sam local start-api --port 3000

# The API will be available at: http://localhost:3000
```

### 2. Start the Frontend

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev

# The frontend will be available at: http://localhost:5173
```

## Detailed Setup

### Backend Setup

#### Prerequisites
- Python 3.12+
- AWS SAM CLI installed
- AWS CLI configured with credentials
- Docker (required for SAM local)

#### Steps

1. **Install Python dependencies**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

2. **Set up local DynamoDB (optional)**:
```bash
# Run DynamoDB Local in Docker
docker run -p 8000:8000 amazon/dynamodb-local

# Create tables
python scripts/create_local_tables.py
```

3. **Start SAM Local API**:
```bash
cd infrastructure
sam build
sam local start-api --port 3000 --env-vars env-local.json
```

#### Environment Configuration

Create `infrastructure/env-local.json`:
```json
{
  "Parameters": {
    "ENVIRONMENT": "local",
    "LOG_LEVEL": "DEBUG",
    "DYNAMODB_TABLE": "bharat-sahayak-data-local",
    "DYNAMODB_ENDPOINT": "http://host.docker.internal:8000",
    "AWS_REGION": "ap-south-1"
  }
}
```

### Frontend Setup

#### Prerequisites
- Node.js 20+
- npm or yarn

#### Steps

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Configure environment**:
The `.env.local` file has been created with:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```

3. **Start development server**:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## API Endpoints

When running locally, the following endpoints are available:

- `POST http://localhost:3000/chat` - Chat with AI assistant
- `POST http://localhost:3000/voice-to-text` - Convert voice to text
- `POST http://localhost:3000/text-to-speech` - Convert text to speech
- `POST http://localhost:3000/eligibility-check` - Check scheme eligibility
- `GET http://localhost:3000/schemes` - List all schemes
- `GET http://localhost:3000/schemes/{id}` - Get scheme details

## Testing the Integration

### 1. Test Chat Endpoint

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "language": "en"}'
```

### 2. Test from Frontend

1. Open http://localhost:5173
2. Click "Start Chatting" button
3. Type a message and send
4. You should see a response from the AI

## Troubleshooting

### Backend Issues

**Error: "No AWS credentials found"**
```bash
# Configure AWS CLI
aws configure
```

**Error: "Docker is not running"**
```bash
# Start Docker Desktop
# Or install Docker: https://docs.docker.com/get-docker/
```

**Error: "Port 3000 already in use"**
```bash
# Find and kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Or use a different port:
sam local start-api --port 3001
# Then update frontend/.env.local to use port 3001
```

### Frontend Issues

**Error: "Failed to load resource: 404"**
- Ensure backend is running on http://localhost:3000
- Check `.env.local` has correct `VITE_API_BASE_URL`
- Restart frontend dev server after changing .env files

**Error: "CORS policy"**
- SAM local should handle CORS automatically
- Check API Gateway CORS configuration in template.yaml

**Error: "Network request failed"**
- Verify backend is running: `curl http://localhost:3000/schemes`
- Check browser console for detailed error messages
- Ensure no firewall blocking localhost connections

## Alternative: Mock Backend

If you can't run SAM local, you can use a mock backend:

```bash
cd frontend
npm run dev:mock
```

This will start the frontend with a mock API that returns sample data.

## Production Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Additional Resources

- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [API Documentation](./docs/API.md)
- [Architecture Overview](./docs/architecture.md)
